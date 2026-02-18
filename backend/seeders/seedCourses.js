const { sequelize } = require('../models');
const Course = require('../models/Course');
const CourseModule = require('../models/CourseModule');
const Lesson = require('../models/Lesson');
const User = require('../models/User');

const coursesData = [
  {
    category: 'AI in FinTech',
    courses: [
      {
        course_name: 'FinTech & AI Mastery',
        course_code: 'FTAI001',
        description: 'Master the intersection of AI and Financial Technology with real-world applications in banking, payments, and wealth management.',
        price: 49999,
        duration_hours: 120,
        difficulty_level: 'advanced',
        language: 'English',  // Added - likely required
        is_active: true       // Added - likely required
      },
      {
        course_name: 'BFSI Domain Excellence Program',
        course_code: 'BFSI001',
        description: 'Comprehensive training in Banking, Financial Services, and Insurance with AI integration.',
        price: 44999,
        duration_hours: 100,
        difficulty_level: 'intermediate',
        language: 'English',
        is_active: true
      },
      {
        course_name: 'Investment Banking & Wealth Tech',
        course_code: 'IBWT001',
        description: 'Deep dive into investment banking operations and wealth management technologies.',
        price: 54999,
        duration_hours: 110,
        difficulty_level: 'advanced',
        language: 'English',
        is_active: true
      },
      {
        course_name: 'AI-Powered Credit & Risk Analytics',
        course_code: 'ACRA001',
        description: 'Learn to build AI models for credit scoring, risk assessment, and fraud detection.',
        price: 39999,
        duration_hours: 90,
        difficulty_level: 'intermediate',
        language: 'English',
        is_active: true
      },
      {
        course_name: 'Digital Payments & Blockchain',
        course_code: 'DPBC001',
        description: 'Explore digital payment systems, cryptocurrency, and blockchain technology.',
        price: 34999,
        duration_hours: 80,
        difficulty_level: 'intermediate',
        language: 'English',
        is_active: true
      },
      {
        course_name: 'RegTech & Compliance Automation',
        course_code: 'RTCA001',
        description: 'Regulatory technology solutions and compliance automation using AI.',
        price: 29999,
        duration_hours: 70,
        difficulty_level: 'beginner',
        language: 'English',
        is_active: true
      }
    ]
  },
  {
    category: 'Product Leadership',
    courses: [
      {
        course_name: 'Product Management Mastery',
        course_code: 'PM001',
        description: 'Complete product management training from ideation to launch and growth.',
        price: 44999,
        duration_hours: 100,
        difficulty_level: 'intermediate',
        language: 'English',
        is_active: true
      },
      {
        course_name: 'AI Product Strategy',
        course_code: 'AIPS001',
        description: 'Build and launch AI-powered products with market-fit strategies.',
        price: 49999,
        duration_hours: 90,
        difficulty_level: 'advanced',
        language: 'English',
        is_active: true
      },
      {
        course_name: 'UX/UI for Product Managers',
        course_code: 'UXPM001',
        description: 'User experience design principles and interface best practices for PMs.',
        price: 29999,
        duration_hours: 60,
        difficulty_level: 'beginner',
        language: 'English',
        is_active: true
      },
      {
        course_name: 'Agile & Scrum for Products',
        course_code: 'AGPM001',
        description: 'Master agile methodologies and scrum framework for product development.',
        price: 24999,
        duration_hours: 50,
        difficulty_level: 'beginner',
        language: 'English',
        is_active: true
      },
      {
        course_name: 'Product Analytics & Metrics',
        course_code: 'PAM001',
        description: 'Data-driven product decisions using analytics and KPI frameworks.',
        price: 34999,
        duration_hours: 70,
        difficulty_level: 'intermediate',
        language: 'English',
        is_active: true
      }
    ]
  },
  {
    category: 'Data Analytics',
    courses: [
      {
        course_name: 'Data Science Foundation',
        course_code: 'DS001',
        description: 'Complete data science training with Python, R, and machine learning basics.',
        price: 39999,
        duration_hours: 120,
        difficulty_level: 'beginner',
        language: 'English',
        is_active: true
      },
      {
        course_name: 'Business Intelligence & Visualization',
        course_code: 'BIVI001',
        description: 'Master BI tools like Tableau, Power BI, and data storytelling.',
        price: 29999,
        duration_hours: 80,
        difficulty_level: 'intermediate',
        language: 'English',
        is_active: true
      },
      {
        course_name: 'Advanced Machine Learning',
        course_code: 'AML001',
        description: 'Deep learning, neural networks, and advanced ML algorithms.',
        price: 54999,
        duration_hours: 140,
        difficulty_level: 'advanced',
        language: 'English',
        is_active: true
      }
    ]
  },
  {
    category: 'Digital Transformation',
    courses: [
      {
        course_name: 'Digital Strategy & Innovation',
        course_code: 'DSI001',
        description: 'Lead digital transformation initiatives in enterprises.',
        price: 44999,
        duration_hours: 90,
        difficulty_level: 'intermediate',
        language: 'English',
        is_active: true
      },
      {
        course_name: 'Cloud Computing Essentials',
        course_code: 'CCE001',
        description: 'AWS, Azure, and GCP fundamentals for digital infrastructure.',
        price: 34999,
        duration_hours: 100,
        difficulty_level: 'beginner',
        language: 'English',
        is_active: true
      },
      {
        course_name: 'AI & Automation in Business',
        course_code: 'AIAB001',
        description: 'Implement AI and automation solutions for business processes.',
        price: 39999,
        duration_hours: 85,
        difficulty_level: 'intermediate',
        language: 'English',
        is_active: true
      }
    ]
  },
  {
    category: 'Integrated Programs',
    courses: [
      {
        course_name: 'MBA++ Program',
        course_code: 'MBA001',
        description: 'Integrated MBA with AI, FinTech, and Product Management specializations.',
        price: 89999,
        duration_hours: 300,
        difficulty_level: 'advanced',
        language: 'English',
        is_active: true
      }
    ]
  },
  {
    category: 'Professional Development',
    courses: [
      {
        course_name: 'Corporate Readiness Program',
        course_code: 'CRP001',
        description: 'Complete professional skills development for corporate careers.',
        price: 14999,
        duration_hours: 40,
        difficulty_level: 'beginner',
        language: 'English',
        is_active: true
      }
    ]
  }
];

async function seedCourses() {
  try {
    console.log('Starting course seeding...\n');

    await sequelize.authenticate();
    console.log('Database connected\n');

    // Optional: Find faculty if needed
    // Uncomment if faculty_id is required
    /*
    const faculty = await User.findOne({ where: { role: 'faculty' } });
    if (!faculty) {
      console.log('No faculty found. Please create a faculty user first.');
      return;
    }
    const facultyRecord = await faculty.getFaculty();
    */

    let totalCourses = 0;

    for (const categoryData of coursesData) {
      console.log(`Seeding ${categoryData.category} courses...`);

      for (const courseData of categoryData.courses) {
        try {
          const course = await Course.create({
                  ...courseData,
                  category: categoryData.category
                });

          // Create modules and lessons (optional - comment out if not needed initially)
          /*
          for (let i = 1; i <= 5; i++) {
            const module = await CourseModule.create({
              course_id: course.id,
              module_number: i,
              module_name: `Module ${i}: ${getModuleName(courseData.course_name, i)}`,
              description: `Comprehensive coverage of key concepts in ${courseData.course_name}`,
              duration_hours: Math.ceil(courseData.duration_hours / 5)
            });

            for (let j = 1; j <= 3; j++) {
              await Lesson.create({
                module_id: module.id,
                lesson_number: j,
                lesson_title: `Lesson ${j}: ${getLessonTitle(courseData.course_name, i, j)}`,
                content_type: 'video',
                content_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                duration_minutes: 45,
                is_preview: i === 1 && j === 1
              });
            }
          }
          */

          totalCourses++;
          console.log(`   ✓ Created "${courseData.course_name}"`);
        } catch (error) {
          console.error(`   ✗ Failed to create "${courseData.course_name}"`);
          console.error('   Error details:', error.errors || error.message);
          console.error('   Data:', courseData);
        }
      }
      console.log();
    }

    console.log(`Seeding completed! Added ${totalCourses} courses.\n`);
    process.exit(0);

  } catch (error) {
    console.error('Error seeding courses:', error);
    console.error('Full error:', error.errors || error.message);
    process.exit(1);
  }
}

function getModuleName(courseName, moduleNumber) {
  const moduleNames = {
    1: 'Fundamentals & Introduction',
    2: 'Core Concepts & Framework',
    3: 'Advanced Techniques',
    4: 'Practical Applications',
    5: 'Capstone & Real-world Projects'
  };
  return moduleNames[moduleNumber];
}

function getLessonTitle(courseName, moduleNumber, lessonNumber) {
  return `Topic ${moduleNumber}.${lessonNumber}`;
}

seedCourses();