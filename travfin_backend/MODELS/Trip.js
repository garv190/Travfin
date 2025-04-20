// MODELS/Trip.js
import { Schema, model } from 'mongoose';

const tripSchema = new Schema({
    name: String,
    creator: { type: Schema.Types.ObjectId, ref: 'mongosu' },
    participants: [{ type: Schema.Types.ObjectId, ref: 'mongosu' }],
    invitedEmails: [String], // Track invited emails
    transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
    createdAt: { type: Date, default: Date.now }
});

export default model('Trip', tripSchema);