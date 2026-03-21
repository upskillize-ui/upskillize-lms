// ============================================================
//  routes/corporate.js  — MERGED Corporate + Placement Routes
//  Mount in server.js:  app.use('/api/corporate', require('./routes/corporate'))
//
//  All placement features (drives, applicants, companies,
//  placement-analytics) now live under /api/corporate/*
//  The separate placement.js router is no longer needed.
// ============================================================
const express = require('express');
const router  = express.Router();
const { Op }  = require('sequelize');

const {
  User, Student, Course, Enrollment,
  CorporateEmployee, EmployeeCourseAssignment,
  CorporateJobPosting, CorporateJobApplication,
  CorporateShortlist, Notification,
  PlacementDrive, DriveApplication,
  PlacementCompany,
} = require('../models');

const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(authorizeRole(['corporate', 'admin']));

// ─── HELPER — in-app notification ────────────────────────────────────────────
async function sendNotification(recipientId, title, message, data = {}) {
  try {
    await Notification.create({
      recipient_user_id: recipientId,
      title,
      message,
      data_json: JSON.stringify(data),
      is_read:   false,
    });
  } catch (err) {
    console.error('Notification error:', err.message);
  }
}

// ═══════════════════════════════════════════════════════════
// ① DASHBOARD STATS
// ═══════════════════════════════════════════════════════════
router.get('/dashboard/stats', async (req, res) => {
  try {
    const corporateId = req.user.id;

    const employees   = await CorporateEmployee.findAll({ where: { corporate_id: corporateId, status: 'active' } });
    const employeeIds = employees.map(e => e.id);
    const assignments = employeeIds.length ? await EmployeeCourseAssignment.findAll({ where: { employee_id: { [Op.in]: employeeIds } } }) : [];
    const jobs        = await CorporateJobPosting.findAll({ where: { corporate_id: corporateId } });
    const jobIds      = jobs.map(j => j.id);
    const applications = jobIds.length ? await CorporateJobApplication.findAll({ where: { job_id: { [Op.in]: jobIds } } }) : [];

    const totalProgress      = assignments.reduce((sum, a) => sum + (a.progress_pct || 0), 0);
    const avgCompletion      = assignments.length > 0 ? Math.round(totalProgress / assignments.length) : 0;
    const certificatesIssued = assignments.filter(a => a.certificate_url).length;
    const activeCourseIds    = new Set(assignments.filter(a => a.status !== 'completed').map(a => a.course_id));

    const drives    = await PlacementDrive.findAll({ where: { created_by: corporateId } });
    const driveIds  = drives.map(d => d.id);
    const driveApps = driveIds.length ? await DriveApplication.findAll({ where: { drive_id: { [Op.in]: driveIds } } }) : [];

    const activeDrives     = drives.filter(d => d.status === 'open').length;
    const totalApplicants  = driveApps.length;
    const shortlistedCount = driveApps.filter(a => ['shortlisted','r1','r2','hr'].includes(a.status)).length;
    const offersMade       = driveApps.filter(a => a.status === 'selected').length;
    const placementRate    = totalApplicants > 0 ? Math.round((offersMade / totalApplicants) * 100) : 0;

    const driveMap     = {};
    drives.forEach(d => { driveMap[d.id] = d; });
    const selectedApps = driveApps.filter(a => a.status === 'selected');
    const totalPackage = selectedApps.reduce((sum, a) => sum + (parseFloat(driveMap[a.drive_id]?.package_lpa) || 0), 0);
    const avgPackage   = selectedApps.length > 0 ? (totalPackage / selectedApps.length).toFixed(1) : 0;

    const now             = new Date();
    const drivesThisMonth = drives.filter(d => {
      const c = new Date(d.createdAt);
      return c.getMonth() === now.getMonth() && c.getFullYear() === now.getFullYear();
    }).length;

    const companiesCount = await PlacementCompany.count({ where: { created_by: corporateId } });

    const recentAssignments = await EmployeeCourseAssignment.findAll({
      where:   employeeIds.length ? { employee_id: { [Op.in]: employeeIds } } : { id: { [Op.is]: null } },
      order:   [['updatedAt', 'DESC']],
      limit:   8,
      include: [
        { model: CorporateEmployee, as: 'employee', attributes: ['name'] },
        { model: Course,            as: 'course',   attributes: ['title'] },
      ],
    });

    const activities = recentAssignments.map(a => ({
      title: a.status === 'completed'
        ? `${a.employee?.name || 'Employee'} completed ${a.course?.title || 'a course'}`
        : `${a.employee?.name || 'Employee'} is enrolled in ${a.course?.title || 'a course'}`,
      time: new Date(a.updatedAt).toLocaleString('en-IN'),
    }));

    res.json({
      success: true,
      stats: {
        employeesEnrolled:   employees.length,
        activeCourses:       activeCourseIds.size,
        avgCompletion,
        certificatesIssued,
        jobPostings:         jobs.length,
        applications:        applications.length,
        shortlisted:         applications.filter(a => a.status === 'shortlisted').length,
        activeDrives,
        totalApplicants,
        shortlistedCount,
        offersMade,
        placementRate,
        drivesThisMonth,
        avgPackage,
        companiesCount,
        planName:           req.user.plan_name    || 'Corporate Pro',
        seatsUsed:          employees.length,
        totalSeats:         req.user.total_seats  || 50,
        renewalDate:        req.user.renewal_date || null,
        subscriptionStatus: 'Active',
      },
      activities,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════
// ② EMPLOYEES
// ═══════════════════════════════════════════════════════════
router.get('/employees', async (req, res) => {
  try {
    const employees = await CorporateEmployee.findAll({
      where: { corporate_id: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    const result = await Promise.all(employees.map(async emp => {
      const assignments    = await EmployeeCourseAssignment.findAll({
        where:   { employee_id: emp.id },
        include: [{ model: Course, as: 'course', attributes: ['id', 'title'] }],
      });
      const totalProgress  = assignments.reduce((s, a) => s + (a.progress_pct || 0), 0);
      const completion_avg = assignments.length > 0 ? Math.round(totalProgress / assignments.length) : 0;
      return { ...emp.toJSON(), assigned_courses: assignments.map(a => ({ id: a.course_id, title: a.course?.title })), completion_avg };
    }));
    res.json({ success: true, employees: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/employees/invite', async (req, res) => {
  try {
    const { emails } = req.body;
    if (!emails?.length) return res.status(400).json({ success: false, message: 'Email list is required' });

    const created = [];
    for (const email of emails) {
      let user = await User.findOne({ where: { email } });
      if (!user) {
        user = await User.create({ email, full_name: email.split('@')[0], role: 'employee', status: 'invited', password: Math.random().toString(36).slice(-10) });
      }
      const [emp] = await CorporateEmployee.findOrCreate({
        where:    { corporate_id: req.user.id, user_id: user.id },
        defaults: { corporate_id: req.user.id, user_id: user.id, email, name: user.full_name, status: 'active' },
      });
      created.push(emp);
      await sendNotification(user.id, 'Corporate Training Invitation', 'You have been invited to join the corporate training portal.', { corporate_id: req.user.id });
    }
    res.json({ success: true, employees: created, invited: created.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/employee/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
    const emp = await CorporateEmployee.findOne({ where: { id: req.params.id, corporate_id: req.user.id } });
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
    await emp.update({ status });
    res.json({ success: true, employee: emp.toJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════
// ③ COURSE ASSIGNMENTS
// ═══════════════════════════════════════════════════════════
router.post('/assign', async (req, res) => {
  try {
    const { employee_ids, course_id, deadline, department } = req.body;
    if (!course_id) return res.status(400).json({ success: false, message: 'course_id is required' });

    let targetIds = employee_ids || [];
    if (!targetIds.length && department) {
      const deptEmps = await CorporateEmployee.findAll({ where: { corporate_id: req.user.id, department, status: 'active' } });
      targetIds = deptEmps.map(e => e.id);
    }
    if (!targetIds.length) {
      const allEmps = await CorporateEmployee.findAll({ where: { corporate_id: req.user.id, status: 'active' } });
      targetIds = allEmps.map(e => e.id);
    }

    const course = await Course.findByPk(course_id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const assignments = [];
    for (const empId of targetIds) {
      const emp = await CorporateEmployee.findOne({ where: { id: empId, corporate_id: req.user.id } });
      if (!emp) continue;
      const [assignment, isNew] = await EmployeeCourseAssignment.findOrCreate({
        where:    { employee_id: empId, course_id },
        defaults: { employee_id: empId, course_id, assigned_by: req.user.id, deadline: deadline || null, progress_pct: 0, status: 'assigned' },
      });
      assignments.push(assignment);
      if (isNew && emp.user_id) {
        await sendNotification(emp.user_id, `New Course Assigned: ${course.title}`, `You have been assigned "${course.title}".${deadline ? ` Complete by ${new Date(deadline).toLocaleDateString('en-IN')}.` : ''}`, { course_id, assignment_id: assignment.id });
      }
    }
    res.json({ success: true, assignments, assigned_count: assignments.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/assignments', async (req, res) => {
  try {
    const employees = await CorporateEmployee.findAll({ where: { corporate_id: req.user.id } });
    const empIds    = employees.map(e => e.id);
    const assignments = empIds.length ? await EmployeeCourseAssignment.findAll({
      where:   { employee_id: { [Op.in]: empIds } },
      order:   [['createdAt', 'DESC']],
      include: [
        { model: CorporateEmployee, as: 'employee', attributes: ['name', 'department'] },
        { model: Course,            as: 'course',   attributes: ['title'] },
      ],
    }) : [];

    const now    = new Date();
    const result = assignments.map(a => {
      let status = a.status;
      if (status !== 'completed' && a.deadline && new Date(a.deadline) < now) status = 'overdue';
      return { id: a.id, employee_id: a.employee_id, employee_name: a.employee?.name, department: a.employee?.department, course_id: a.course_id, course_title: a.course?.title, progress_pct: a.progress_pct || 0, deadline: a.deadline, status, certificate_url: a.certificate_url, completed_at: a.completed_at };
    });
    res.json({ success: true, assignments: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/assignments/export', async (req, res) => {
  try {
    const employees   = await CorporateEmployee.findAll({ where: { corporate_id: req.user.id } });
    const empIds      = employees.map(e => e.id);
    const assignments = empIds.length ? await EmployeeCourseAssignment.findAll({
      where:   { employee_id: { [Op.in]: empIds } },
      include: [
        { model: CorporateEmployee, as: 'employee', attributes: ['name', 'email', 'department'] },
        { model: Course,            as: 'course',   attributes: ['title'] },
      ],
    }) : [];

    const rows = ['Employee,Email,Department,Course,Progress,Status,Deadline,Completed At'];
    for (const a of assignments) {
      rows.push([a.employee?.name||'', a.employee?.email||'', a.employee?.department||'', a.course?.title||'', `${a.progress_pct||0}%`, a.status||'assigned', a.deadline ? new Date(a.deadline).toLocaleDateString('en-IN') : '', a.completed_at ? new Date(a.completed_at).toLocaleDateString('en-IN') : ''].join(','));
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=training-report.csv');
    res.send(rows.join('\n'));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════
// ④ CORPORATE JOB POSTINGS
// ═══════════════════════════════════════════════════════════
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await CorporateJobPosting.findAll({ where: { corporate_id: req.user.id }, order: [['createdAt', 'DESC']] });
    const withCounts = await Promise.all(jobs.map(async j => {
      const count = await CorporateJobApplication.count({ where: { job_id: j.id } });
      return { ...j.toJSON(), application_count: count };
    }));
    res.json({ success: true, jobs: withCounts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/job', async (req, res) => {
  try {
    const { title, description, skills_required, min_cgpa, location, package_lpa, deadline } = req.body;
    if (!title || !description) return res.status(400).json({ success: false, message: 'Title and description are required' });
    const job = await CorporateJobPosting.create({ corporate_id: req.user.id, title, description, skills_required: skills_required||[], min_cgpa: parseFloat(min_cgpa)||0, package_lpa: parseFloat(package_lpa)||0, location: location||'', deadline: deadline||null, status: 'open' });
    res.json({ success: true, job: { ...job.toJSON(), application_count: 0 } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/job/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['open','closed'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
    const job = await CorporateJobPosting.findOne({ where: { id: req.params.id, corporate_id: req.user.id } });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    await job.update({ status });
    res.json({ success: true, job: job.toJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════
// ⑤ SHORTLIST
// ═══════════════════════════════════════════════════════════
router.get('/shortlist', async (req, res) => {
  try {
    const entries = await CorporateShortlist.findAll({
      where:   { corporate_id: req.user.id },
      order:   [['createdAt', 'DESC']],
      include: [
        { model: User,                as: 'student', attributes: ['full_name', 'email'] },
        { model: CorporateJobPosting, as: 'job',     attributes: ['title'] },
        { model: Student,             as: 'profile', attributes: ['resume_url'] },
      ],
    });
    const result = entries.map(e => ({ id: e.id, student_id: e.student_id, student_name: e.student?.full_name, student_email: e.student?.email, job_id: e.job_id, job_title: e.job?.title, note: e.note, resume_url: e.profile?.resume_url, shortlisted_at: e.createdAt }));
    res.json({ success: true, shortlist: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/shortlist', async (req, res) => {
  try {
    const { student_id, job_id, note } = req.body;
    if (!student_id || !job_id) return res.status(400).json({ success: false, message: 'student_id and job_id are required' });
    const job = await CorporateJobPosting.findOne({ where: { id: job_id, corporate_id: req.user.id } });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or not yours' });
    const [entry, created] = await CorporateShortlist.findOrCreate({ where: { corporate_id: req.user.id, student_id, job_id }, defaults: { corporate_id: req.user.id, student_id, job_id, note: note||null } });
    if (!created) return res.status(409).json({ success: false, message: 'Student already shortlisted for this job' });
    await sendNotification(student_id, `Interview Invitation — ${job.title}`, `You have been shortlisted for "${job.title}" at ${req.user.company_name||'a company'}.`, { job_id, corporate_id: req.user.id });
    res.json({ success: true, entry: entry.toJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════
// ⑥ STUDENT BROWSING
// ═══════════════════════════════════════════════════════════
router.get('/students', async (req, res) => {
  try {
    const { skills, cgpa_min, batch, course } = req.query;
    const where = {};
    if (cgpa_min) where.cgpa   = { [Op.gte]: parseFloat(cgpa_min) };
    if (batch)    where.batch   = batch;
    if (course)   where.course  = course;

    const students = await Student.findAll({ where, include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email'] }], order: [['cgpa', 'DESC']] });
    let filtered = students;
    if (skills) {
      const skillList = skills.split(',').map(s => s.trim().toLowerCase());
      filtered = students.filter(s => (s.skills||[]).some(sk => skillList.includes(sk.toLowerCase())));
    }
    const result = filtered.map(s => ({ id: s.user?.id, full_name: s.user?.full_name, email: s.user?.email, course: s.course, cgpa: s.cgpa, batch: s.batch, skills: s.skills||[], resume_url: s.resume_url, certificate_urls: s.certificate_urls||[], completed_courses: s.completed_courses||0, attendance: s.attendance }));
    res.json({ success: true, students: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════
// ⑦ PLACEMENT DRIVES
// ═══════════════════════════════════════════════════════════
router.get('/drives', async (req, res) => {
  try {
    const drives = await PlacementDrive.findAll({ where: { created_by: req.user.id }, order: [['createdAt', 'DESC']] });
    const withCounts = await Promise.all(drives.map(async d => {
      const apps = await DriveApplication.findAll({ where: { drive_id: d.id } });
      return { ...d.toJSON(), applicant_count: apps.length, shortlisted_count: apps.filter(a => ['shortlisted','r1','r2','hr'].includes(a.status)).length, offer_count: apps.filter(a => a.status === 'selected').length };
    }));
    res.json({ success: true, drives: withCounts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/drive', async (req, res) => {
  try {
    const { company_name, jd, package_lpa, min_cgpa, required_skills, eligible_batches, deadline, location, role_type } = req.body;
    if (!company_name || !jd || !deadline) return res.status(400).json({ success: false, message: 'Company name, JD and deadline are required' });
    const drive = await PlacementDrive.create({ created_by: req.user.id, company_name, jd_text: jd, package_lpa: parseFloat(package_lpa)||0, min_cgpa: parseFloat(min_cgpa)||0, required_skills: required_skills||[], eligible_batches: eligible_batches||[], deadline, location: location||'', role_type: role_type||'full-time', status: 'open' });
    res.json({ success: true, drive: { ...drive.toJSON(), applicant_count: 0, shortlisted_count: 0, offer_count: 0 } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/drive/:id', async (req, res) => {
  try {
    const drive = await PlacementDrive.findOne({ where: { id: req.params.id, created_by: req.user.id } });
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' });
    const { company_name, jd, package_lpa, min_cgpa, required_skills, eligible_batches, deadline, location, role_type, status } = req.body;
    await drive.update({
      company_name:     company_name     || drive.company_name,
      jd_text:          jd               || drive.jd_text,
      package_lpa:      package_lpa      != null ? parseFloat(package_lpa) : drive.package_lpa,
      min_cgpa:         min_cgpa         != null ? parseFloat(min_cgpa)    : drive.min_cgpa,
      required_skills:  required_skills  || drive.required_skills,
      eligible_batches: eligible_batches || drive.eligible_batches,
      deadline:         deadline          || drive.deadline,
      location:         location          != null ? location  : drive.location,
      role_type:        role_type          || drive.role_type,
      status:           status             || drive.status,
    });
    res.json({ success: true, drive: drive.toJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/drive/:id', async (req, res) => {
  try {
    const drive = await PlacementDrive.findOne({ where: { id: req.params.id, created_by: req.user.id } });
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' });
    await DriveApplication.destroy({ where: { drive_id: drive.id } });
    await drive.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════
// ⑧ DRIVE APPLICANTS
// ═══════════════════════════════════════════════════════════
router.get('/drive/:id/applicants', async (req, res) => {
  try {
    const drive = await PlacementDrive.findOne({ where: { id: req.params.id, created_by: req.user.id } });
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' });
    const applications = await DriveApplication.findAll({
      where:   { drive_id: drive.id },
      order:   [['createdAt', 'DESC']],
      include: [{ model: User, as: 'student', attributes: ['id','full_name','email'], include: [{ model: Student, as: 'studentProfile', attributes: ['cgpa','skills','resume_url','batch','course','attendance'] }] }],
    });
    const applicants = applications.map(app => ({ id: app.id, student_id: app.student?.id, name: app.student?.full_name, email: app.student?.email, course: app.student?.studentProfile?.course, cgpa: app.student?.studentProfile?.cgpa, skills: app.student?.studentProfile?.skills||[], resume_url: app.student?.studentProfile?.resume_url, attendance: app.student?.studentProfile?.attendance, batch: app.student?.studentProfile?.batch, status: app.status, round_number: app.round_number, applied_at: app.createdAt }));
    res.json({ success: true, applicants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/applicant/:id/status', async (req, res) => {
  try {
    const { status, reason } = req.body;
    const validStatuses = ['applied','shortlisted','r1','r2','hr','selected','rejected'];
    if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

    const app = await DriveApplication.findByPk(req.params.id, { include: [{ model: PlacementDrive, as: 'drive' }] });
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    if (app.drive.created_by !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden' });

    const roundMap = { r1:1, r2:2, hr:3, selected:4 };
    const updates  = { status, rejection_reason: reason||null };
    if (roundMap[status]) updates.round_number = roundMap[status];
    if (status === 'selected') updates.selected_at = new Date();
    await app.update(updates);

    const msgs = { shortlisted: `You have been shortlisted for ${app.drive.company_name}.`, r1: `Your Round 1 interview for ${app.drive.company_name} has been scheduled.`, r2: `You have advanced to Round 2 for ${app.drive.company_name}.`, hr: `You have advanced to the HR round for ${app.drive.company_name}.`, selected: `Congratulations! You have been selected by ${app.drive.company_name}.`, rejected: `Thank you for applying to ${app.drive.company_name}. You have not been shortlisted this time.` };
    if (msgs[status]) await sendNotification(app.student_id, `${app.drive.company_name} — Status Update`, msgs[status], { drive_id: app.drive_id, status });

    res.json({ success: true, application: app.toJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════
// ⑨ COMPANY PARTNERS
// ═══════════════════════════════════════════════════════════
router.get('/companies', async (req, res) => {
  try {
    const companies = await PlacementCompany.findAll({ where: { created_by: req.user.id }, order: [['createdAt', 'DESC']] });
    res.json({ success: true, companies });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/company', async (req, res) => {
  try {
    const { name, industry, website, contact_name, contact_email, location } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Company name is required' });
    const company = await PlacementCompany.create({ created_by: req.user.id, name, industry, website, contact_name, contact_email, location });
    res.json({ success: true, company });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════
// ⑩ ANALYTICS — Training
// ═══════════════════════════════════════════════════════════
router.get('/analytics', async (req, res) => {
  try {
    const employees = await CorporateEmployee.findAll({ where: { corporate_id: req.user.id } });
    const empIds    = employees.map(e => e.id);
    const assignments = empIds.length ? await EmployeeCourseAssignment.findAll({
      where:   { employee_id: { [Op.in]: empIds } },
      include: [
        { model: CorporateEmployee, as: 'employee', attributes: ['department'] },
        { model: Course,            as: 'course',   attributes: ['title'] },
      ],
    }) : [];

    const totalProgress      = assignments.reduce((s, a) => s + (a.progress_pct||0), 0);
    const avgCompletion      = assignments.length > 0 ? Math.round(totalProgress / assignments.length) : 0;
    const certificatesIssued = assignments.filter(a => a.certificate_url).length;
    const activeEmployees    = employees.filter(e => e.status === 'active').length;
    const coursesAssigned    = new Set(assignments.map(a => a.course_id)).size;

    const deptMap = {};
    for (const a of assignments) {
      const dept = a.employee?.department || 'General';
      if (!deptMap[dept]) deptMap[dept] = { employees: new Set(), total: 0, sum: 0 };
      deptMap[dept].employees.add(a.employee_id);
      deptMap[dept].total++;
      deptMap[dept].sum += a.progress_pct || 0;
    }
    const departmentStats = Object.entries(deptMap).map(([department, d]) => ({ department, employees: d.employees.size, completion: d.total > 0 ? Math.round(d.sum / d.total) : 0 }));

    const courseMap = {};
    for (const a of assignments) {
      const title = a.course?.title || 'Unknown';
      if (!courseMap[title]) courseMap[title] = { assigned: 0, completed: 0, in_progress: 0 };
      courseMap[title].assigned++;
      if (a.status === 'completed')   courseMap[title].completed++;
      if (a.status === 'in_progress') courseMap[title].in_progress++;
    }
    const courseStats = Object.entries(courseMap).map(([title, d]) => ({ title, ...d }));

    res.json({ success: true, analytics: { avgCompletion, certificatesIssued, activeEmployees, coursesAssigned, departmentStats, courseStats } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════
// ⑪ ANALYTICS — Placement
// ═══════════════════════════════════════════════════════════
router.get('/placement-analytics', async (req, res) => {
  try {
    const drives   = await PlacementDrive.findAll({ where: { created_by: req.user.id } });
    const driveIds = drives.map(d => d.id);
    const apps     = driveIds.length ? await DriveApplication.findAll({ where: { drive_id: { [Op.in]: driveIds } } }) : [];

    const totalPlaced     = apps.filter(a => a.status === 'selected').length;
    const totalApplicants = apps.length;
    const placementRate   = totalApplicants > 0 ? Math.round((totalPlaced / totalApplicants) * 100) : 0;

    const driveMap     = {};
    drives.forEach(d => { driveMap[d.id] = d; });
    const selectedApps = apps.filter(a => a.status === 'selected');
    const totalPackage = selectedApps.reduce((sum, a) => sum + (parseFloat(driveMap[a.drive_id]?.package_lpa)||0), 0);
    const avgPackage   = selectedApps.length > 0 ? (totalPackage / selectedApps.length).toFixed(1) : 0;
    const companiesCount = await PlacementCompany.count({ where: { created_by: req.user.id } });

    const drivePerformance = drives.map(d => {
      const driveApps = apps.filter(a => a.drive_id === d.id);
      return { company: d.company_name, applied: driveApps.length, shortlisted: driveApps.filter(a => ['shortlisted','r1','r2','hr'].includes(a.status)).length, selected: driveApps.filter(a => a.status === 'selected').length, package: d.package_lpa || 0 };
    });

    const batchMap = {};
    for (const app of apps) {
      const student = await Student.findOne({ where: { user_id: app.student_id } });
      const batch   = student?.batch || 'Unknown';
      if (!batchMap[batch]) batchMap[batch] = { total: 0, placed: 0 };
      batchMap[batch].total++;
      if (app.status === 'selected') batchMap[batch].placed++;
    }
    const batchPlacement = Object.entries(batchMap).map(([batch, data]) => ({ batch, rate: data.total > 0 ? Math.round((data.placed / data.total) * 100) : 0 }));

    res.json({ success: true, analytics: { placementRate, totalPlaced, avgPackage, companiesCount, drivePerformance, batchPlacement } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════
// ⑫ ENROLLED COURSES (officer's own)
// ═══════════════════════════════════════════════════════════
router.get('/enrolled-courses', async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where:   { user_id: req.user.id },
      include: [{ model: Course, as: 'course', attributes: ['id','title','description','category','tags','duration','instructor_name','rating','enrolled_count','preview_url'] }],
      order:   [['createdAt', 'DESC']],
    });
    const result = enrollments.map(e => ({ course_id: e.course_id, status: e.status||'enrolled', progress: e.progress||0, enrolled_at: e.createdAt, course: e.course }));
    res.json({ success: true, enrollments: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;