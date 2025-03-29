// models/Group.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
  name: { type: String, required: true, unique: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  expenses: [{ type: Schema.Types.ObjectId, ref: 'Expense' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', groupSchema);