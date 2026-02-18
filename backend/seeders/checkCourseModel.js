const { sequelize } = require('../models');
const Course = require('../models/Course');

async function checkCourseModel() {
  try {
    await sequelize.authenticate();
    console.log('Database connected\n');

    // Get model attributes
    console.log('=== COURSE MODEL SCHEMA ===\n');
    const attributes = Course.rawAttributes;

    for (const [fieldName, fieldConfig] of Object.entries(attributes)) {
      console.log(`Field: ${fieldName}`);
      console.log(`  Type: ${fieldConfig.type.constructor.name}`);
      console.log(`  AllowNull: ${fieldConfig.allowNull !== false}`);
      
      if (fieldConfig.defaultValue !== undefined) {
        console.log(`  Default: ${fieldConfig.defaultValue}`);
      }
      
      if (fieldConfig.validate) {
        console.log(`  Validation: ${JSON.stringify(fieldConfig.validate)}`);
      }
      
      if (fieldConfig.type.values) {
        console.log(`  Enum Values: [${fieldConfig.type.values.join(', ')}]`);
      }
      
      console.log();
    }

    // Test data
    console.log('\n=== TESTING COURSE CREATION ===\n');
    
    const testCourse = {
      course_name: 'Test Course',
      course_code: 'TEST001',
      description: 'Test Description',
      category: 'AI in FinTech',
      price: 9999,
      duration_hours: 50,
      difficulty_level: 'beginner',
      language: 'English',
      is_active: true,
      is_published: true
    };

    console.log('Attempting to create course with data:');
    console.log(JSON.stringify(testCourse, null, 2));
    console.log();

    try {
      const course = await Course.create(testCourse);
      console.log('✓ SUCCESS! Course created with ID:', course.id);
      
      // Clean up
      await course.destroy();
      console.log('✓ Test course deleted');
      
    } catch (error) {
      console.log('✗ FAILED to create course');
      console.log('\nValidation Errors:');
      if (error.errors) {
        error.errors.forEach(err => {
          console.log(`  - ${err.path}: ${err.message}`);
          console.log(`    Value: ${err.value}`);
          console.log(`    Type: ${err.type}`);
        });
      } else {
        console.log(error.message);
      }
    }

    process.exit(0);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkCourseModel();