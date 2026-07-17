import mongoose, { Schema } from 'mongoose';

export interface ISlot {
  time: string;
  isBooked: boolean;
  patientId?: mongoose.Types.ObjectId;
}

export interface ISchedule extends mongoose.Document {
  doctorId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  totalTokens: number;
  slotDurationMinutes: number;
  slots: ISlot[];
}

const SlotSchema: Schema = new Schema({
  time: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
  patientId: { type: Schema.Types.ObjectId, ref: 'User' },
});

const ScheduleSchema: Schema = new Schema(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    totalTokens: { type: Number, required: true },
    slotDurationMinutes: { type: Number, required: true },
    slots: [SlotSchema],
  },
  { timestamps: true }
);

// Ensure a doctor can only have one schedule per day
ScheduleSchema.index({ doctorId: 1, date: 1 }, { unique: true });

export default mongoose.model<ISchedule>('Schedule', ScheduleSchema);
