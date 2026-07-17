const mongoose = require('mongoose');

const run = async () => {
  try {
    await mongoose.connect('mongodb+srv://ashinpp4132_db_user:Ashinpp1212@cluster0.wwgei2z.mongodb.net/melodia?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected');
    const User = mongoose.connection.collection('users');
    const Schedule = mongoose.connection.collection('schedules');
    
    const doctors = await User.find({ role: 'DOCTOR' }).toArray();
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    
    const activeSchedules = await Schedule.find({
      date: { $gte: today },
      'slots.0': { $exists: true }
    }).toArray();

    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: doctors[0]._id, role: 'PATIENT' }, 'my_super_secret_jwt_key_for_development', { expiresIn: '30d' });
    console.log('Token:', token);

    console.log('Result:', result.length);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

run();
