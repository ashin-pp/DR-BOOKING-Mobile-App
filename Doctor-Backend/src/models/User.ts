import mongoose, { Schema } from 'mongoose';
import { UserRole } from '../constants/enums';
import { IUser } from '../types';

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.PATIENT },
    phone: { type: String },
    age: { type: Number },
    bloodGroup: { type: String },
    profileImage: { type: String },
    
    // Doctor Specific
    specialization: { type: String },
    experience: { type: Number },
    consultationFee: { type: Number },
    about: { type: String },
    availableWorkingHours: {
      start: { type: String },
      end: { type: String },
    },
  },
  { timestamps: true }
);

// Prevent returning passwordHash in JSON
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export default mongoose.model<IUser>('User', UserSchema);
