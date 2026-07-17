const mongoose = require('mongoose');
const User = require('./src/models/User').default;
const dotenv = require('dotenv');

dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Find a doctor
  const doctor = await User.findOne({ role: 'doctor' });
  if (!doctor) {
    console.log('No doctor found');
    process.exit(0);
  }

  console.log('Found doctor:', doctor.name);

  // Try to update it the same way the controller does
  doctor.specialization = 'Cardiologist';
  doctor.experience = 10;
  doctor.consultationFee = 150;

  try {
    await doctor.save();
    console.log('Update successful!');
  } catch (err) {
    console.error('Update failed with error:', err);
  }
  
  process.exit(0);
}

test();
