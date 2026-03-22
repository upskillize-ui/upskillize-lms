// ============================================================
// backend/utils/email.js  (or wherever your email.js is)
// Uses Resend — already configured in your .env
// ============================================================

const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Generic send function (existing) ──────────────────────
const sendEmail = async (to, subject, html) => {
  try {
    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL,  // amit@upskillize.com
      to:   to,
      subject: subject,
      html: html,
    });
    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// ── NEW: Admin notification on new user registration ──────
const sendNewUserNotification = async (user) => {
  const adminEmail = 'upskillize@gmail.com';

  const roleEmoji = { student:'🎓', faculty:'👨‍🏫', admin:'🛡️' }[user.role] || '👤';
  const roleLabel = user.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'User';
  const adminUrl = `${process.env.FRONTEND_URL || 'https://lms.upskillize.com'}/admin/users`;
  const time = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#f7f8fc;padding:24px;border-radius:12px;">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#1a2744,#2c3e6b);border-radius:10px;padding:22px 24px;margin-bottom:20px;text-align:center;">
        <h1 style="color:#b8960b;font-size:22px;margin:0 0 6px;">Upskillize LMS</h1>
        <p style="color:rgba(255,255,255,0.55);font-size:13px;margin:0;">New User Registration — Admin Action Required</p>
      </div>

      <!-- Alert -->
      <div style="background:#fff;border:1px solid #e8e9f0;border-left:4px solid #b8960b;border-radius:10px;padding:16px 20px;margin-bottom:16px;">
        <p style="font-size:15px;font-weight:700;color:#1a2744;margin:0 0 4px;">${roleEmoji} New ${roleLabel} Registered</p>
        <p style="font-size:13px;color:#72706b;margin:0;">A new user has registered and is waiting for your approval before they can log in.</p>
      </div>

      <!-- User details -->
      <div style="background:#fff;border:1px solid #e8e9f0;border-radius:10px;padding:18px 20px;margin-bottom:16px;">
        <p style="font-size:11px;font-weight:700;color:#a8a49f;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">User Details</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;font-size:13px;color:#72706b;width:130px;">Full Name</td>
            <td style="padding:8px 0;font-size:13px;font-weight:700;color:#1a2744;">${user.full_name}</td>
          </tr>
          <tr style="border-top:1px solid #f0f0f0;">
            <td style="padding:8px 0;font-size:13px;color:#72706b;">Email</td>
            <td style="padding:8px 0;font-size:13px;font-weight:600;color:#1a2744;">${user.email}</td>
          </tr>
          <tr style="border-top:1px solid #f0f0f0;">
            <td style="padding:8px 0;font-size:13px;color:#72706b;">Phone</td>
            <td style="padding:8px 0;font-size:13px;color:#1a2744;">${user.phone || '—'}</td>
          </tr>
          <tr style="border-top:1px solid #f0f0f0;">
            <td style="padding:8px 0;font-size:13px;color:#72706b;">Role</td>
            <td style="padding:8px 0;">
              <span style="background:#eef2fb;color:#1a2744;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:700;">
                ${roleEmoji} ${roleLabel}
              </span>
            </td>
          </tr>
          <tr style="border-top:1px solid #f0f0f0;">
            <td style="padding:8px 0;font-size:13px;color:#72706b;">Registered At</td>
            <td style="padding:8px 0;font-size:13px;color:#1a2744;">${time}</td>
          </tr>
        </table>
      </div>

      <!-- CTA Button -->
      <div style="text-align:center;margin-bottom:20px;">
        <a href="${adminUrl}"
          style="display:inline-block;background:#1a2744;color:#fff;text-decoration:none;padding:13px 32px;border-radius:8px;font-size:14px;font-weight:700;letter-spacing:0.02em;">
          → Approve in Admin Panel
        </a>
      </div>

      <!-- Footer -->
      <p style="text-align:center;font-size:12px;color:#a8a49f;margin:0;line-height:1.6;">
        Automated notification from Upskillize LMS<br/>
        Do not reply to this email.
      </p>

    </div>
  `;

  try {
    await resend.emails.send({
      from:    process.env.FROM_EMAIL,   // amit@upskillize.com
      to:      adminEmail,               // upskillize@gmail.com
      subject: `${roleEmoji} New ${roleLabel} Registration — Approval Required`,
      html,
    });
    console.log(`✅ Admin notified about new ${user.role}: ${user.email}`);
  } catch (err) {
    // Don't crash registration if email fails
    console.error('❌ Admin notification email failed:', err.message);
  }
};

module.exports = { resend, sendEmail, sendNewUserNotification };