// models/Expense.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  paidBy: { type: Schema.Types.ObjectId, ref: 'mongosu', required: true },
  group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  shares: [{
    user: { type: Schema.Types.ObjectId, ref: 'mongosu', required: true },
    amount: { type: Number, required: true, min: 0 }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', expenseSchema);