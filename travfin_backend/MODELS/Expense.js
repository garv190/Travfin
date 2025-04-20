// models/Expense.js
import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

const expenseSchema = new Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  paidBy: { type: Schema.Types.ObjectId, ref: 'mongosu', required: true },
  group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  shares: [{
    user: { type: Schema.Types.ObjectId, ref: 'mongosu', required: true },
    amount: { type: Number, required: true, min: 0 }
  }],
  billUrl: {
    type: String,
    default: ''
  },
  createdAt: { type: Date, default: Date.now }
});

export default model('Expense', expenseSchema);