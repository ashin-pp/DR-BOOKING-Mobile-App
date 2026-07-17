const mongoose = require('mongoose');

const run = async () => {
  try {
    await mongoose.connect('mongodb+srv://ashinpp4132_db_user:Ashinpp1212@cluster0.wwgei2z.mongodb.net/melodia?retryWrites=true&w=majority&appName=Cluster0');
    
    // Define minimal Schema
    const Schema = mongoose.Schema;
    const ScheduleSchema = new Schema({
      doctorId: { type: Schema.Types.ObjectId },
      date: String,
      slots: []
    });
    const Schedule = mongoose.model('Schedule', ScheduleSchema);

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    console.log('Querying Mongoose Model...');
    const activeSchedules = await Schedule.find({
      date: { $gte: today },
      'slots.0': { $exists: true }
    }).select('doctorId');

    console.log('Found:', activeSchedules.length);
  } catch(e) {
    console.error('Error:', e);
  } finally {
    process.exit(0);
  }
}

run();
