const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mongosu',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired'],
    default: 'pending'
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 7*24*60*60*1000 // 7 days
  }
});

module.exports = mongoose.model('Invitation', invitationSchema);