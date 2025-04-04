const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  trip: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Trip',
    required: true
  },
  amount: { 
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  payer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'mongosu',
    required: true
  },
  shares: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'mongosu',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending'
    }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add validation to ensure sum of shares equals transaction amount
transactionSchema.pre('validate', function(next) {
  const totalShares = this.shares.reduce((sum, share) => sum + share.amount, 0);
  
  if (Math.abs(totalShares - this.amount) > 0.01) {
    next(new Error('Sum of shares must equal transaction amount'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);