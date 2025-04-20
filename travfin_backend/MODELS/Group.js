// models/Group.js
import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

const groupSchema = new Schema({
  name: { type: String, required: true, unique: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  expenses: [{ type: Schema.Types.ObjectId, ref: 'Expense' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

export default model('Group', groupSchema);