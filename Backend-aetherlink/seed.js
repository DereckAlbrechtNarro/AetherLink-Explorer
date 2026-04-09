// Backend-aetherlink/seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

async function createAdmin() {
  try {
    const email = 'admin@aetherlink.com';
    const password = 'admin123';
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        email,
        password: hashedPassword,
        role: 'admin'
      }
    });
    
    if (created) {
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', email);
      console.log('🔑 Password:', password);
    } else {
      // Update existing user to admin and reset password
      await user.update({ 
        role: 'admin',
        password: hashedPassword 
      });
      console.log('✅ Existing user updated to admin with new password');
      console.log('📧 Email:', email);
      console.log('🔑 Password:', password);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

createAdmin();