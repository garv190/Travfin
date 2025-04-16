// MODELS/Trip.js
const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    name: String,
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'mongosu' },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'mongosu' }],
    invitedEmails: [String], // Track invited emails
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trip', tripSchema);