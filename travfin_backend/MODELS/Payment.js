const PaymentSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
    payerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    payeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['INITIATED', 'COMPLETED', 'FAILED'], 
      default: 'INITIATED' 
    },
    referenceId: { type: String },
    paymentMode: { type: String },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
  });
  
  const Payment = mongoose.model('Payment', PaymentSchema);



  ///sendinvitations
  //setParticipantEmails
  //handleCreateTrip
  //715    "trafin704@gmail.com"