// models/Balance.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const balanceSchema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  lastUpdated: { type: Date, default: Date.now }
});

// Index for faster querying
balanceSchema.index({ from: 1, to: 1, group: 1 }, { unique: true });

module.exports = mongoose.model('Balance', balanceSchema);