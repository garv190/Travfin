// models/Balance.js
import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

const balanceSchema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  lastUpdated: { type: Date, default: Date.now }
});

// Index for faster querying
balanceSchema.index({ from: 1, to: 1, group: 1 }, { unique: true });

export default model('Balance', balanceSchema);