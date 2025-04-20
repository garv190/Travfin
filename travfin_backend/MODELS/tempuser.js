import { Schema, model } from 'mongoose';

const tempUserSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  otp: String,
  createdAt: { type: Date, default: Date.now, expires: 600 } // Auto-delete after 10 minutes
});

export default model('TempUser', tempUserSchema);