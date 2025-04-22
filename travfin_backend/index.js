import express from 'express';
const app = express();
import cors from 'cors';
// import { json }from 'body-parser';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { genSaltSync , hashSync, compareSync } from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();
import TempUser  from './MODELS/tempuser.js';
import { createTransport } from 'nodemailer';
import { generate } from 'otp-generator';
import Trip from './MODELS/Trip.js';
import Invitations from './MODELS/Invitation.js';
import Transaction from './MODELS/Transaction.js';
import User from './MODELS/s.js'; // Assuming this is your User model
import './db.js';
import mongoose from 'mongoose';
const { sign, verify } = jwt;

app.use(cors({
  origin: ['https://elegant-speculoos-e92666.netlify.app'], // No trailing slash
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

const transporter = createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Existing routes (retained from your code)
app.get('/', (req, res) => res.json({ message: "Welcome to this page" }));



app.post('/signup', async (req, res, next) => {
    try {
        const { name, email, password, confirmpassword } = req.body;

        const [existingUser, existingTempUser] = await Promise.all([
            TempUser.findOne({ email }),
            User.findOne({ email })
        ]);

        if (existingUser || existingTempUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists or verification pending"
            });
        }

        if (password !== confirmpassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confirm password do not match"
            });
        }

        const otp = generate(6, {
            upperCase: false,
            specialChars: false,
            alphabets: false
        });

        const salt = await genSaltSync(10);
        const hash = await hashSync(password, salt);

        const newTempUser = new TempUser({
            name,
            email,
            password: hash,
            otp
        });

        await newTempUser.save();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification OTP',
            text: `Your OTP for verification is: ${otp}`
        });

        res.status(200).json({
            success: true,
            message: "OTP sent to email"
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});




app.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const tempUser = await TempUser.findOne({ email });

        if (!tempUser) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP or email"
            });
        }

        if (tempUser.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        const newUser = new User({
            name: tempUser.name,
            email: tempUser.email,
            password: tempUser.password
        });

        await newUser.save();
        await TempUser.deleteOne({ email });

        res.status(200).json({
            success: true,
            message: "Account verified successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});




app.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existinguser = await User.findOne({ email });

        if (!existinguser) {
            return res.json({ message: "User does not exist" });
        }

        const isPasswordCorrect = await compareSync(password, existinguser.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid password" });

        const accesstoken = sign(
            { id: existinguser._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "5d" }
        );

        const refreshtoken = sign(
            { id: existinguser._id },
            process.env.JWT_REFRESH_SECRET_KEY,
            { expiresIn: "7d" }
        );

        existinguser.refreshtoken = refreshtoken;
        await existinguser.save();

       
res.cookie("accesstoken", accesstoken, {
  httpOnly: true,
  secure: true, 
  sameSite: 'None',  
  path: "/"
});

res.cookie("refreshToken", refreshtoken, {
  httpOnly: true,
  secure: true, 
  sameSite: 'None', 
  path: "/"
});

        res.status(200).json({
            success: true,
            accesstoken,
            refreshtoken,
            message: "User is logged in",
            user: {
                id: existinguser._id,
                name: existinguser.name,
                email: existinguser.email
            }
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});





// Updated Trip and Transaction routes
app.post('/trips', authenticateToken, async (req, res) => {
  try {
    const { tripName, participantEmails } = req.body;
    

      // Validate input
      if (!tripName || (typeof participantEmails !== 'string' && !Array.isArray(participantEmails))) {
        return res.status(400).json({
          success: false,
          message: "Trip name and participant emails are required"
        });
      }
  
      // Process emails
      let emailList = [];
      if (typeof participantEmails === 'string') {
        emailList = participantEmails.split(',')
          .map(e => e.trim().toLowerCase())
          .filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
      } else if (Array.isArray(participantEmails)) {
        emailList = participantEmails
          .map(e => String(e).trim().toLowerCase())
          .filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
      }
  
      if (emailList.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid email addresses provided"
        });
      }
    // Find existing users
    const participants = await User.find({
      email: { $in: emailList }
    });

    if (participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No registered users found with the provided emails"
      });
    }

    // Create trip
    const newTrip = await Trip.create({
      name: tripName.trim(),
      creator: req.user.id,
      participants: [req.user.id, ...participants.map(p => p._id)]
    });

    // Get creator details
    const creator = await User.findById(req.user.id);
    
    // Send invitations
    await sendTripInvitations(newTrip, creator, participants);

    // Return populated trip data
    const populatedTrip = await Trip.findById(newTrip._id)
      .populate('participants', 'name email');

    res.status(201).json({ 
      success: true, 
      trip: populatedTrip 
    });

  } catch (error) {
    console.error('Trip creation error:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Server error'
    });
  }
});









app.post('/helloworld', authenticateToken, async (req, res) => {
  try {
    const { participantEmails } = req.body;
    // const creatorId = req.user.id;

    const trafin=`http://localhost:3000/`

    // Validate input
    if (!participantEmails || typeof participantEmails !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Participant emails are required as a comma-separated string"
      });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: participantEmails,
      subject: 'Invitation to Join TravFin',
      text: `Dear ${participantEmails}, click on ${trafin} to join this application`
  });

  res.status(200).json({
      success: true,
      message: "Invitation sent to required"
  });
  }
     catch (error) {
    console.error('Invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

















app.post('/trips/:tripId/join', async (req, res) => {
  try {
    const token = req.query.token;
    const decoded = verify(token, process.env.JWT_SECRET_KEY);
    
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });

    if (!trip.participants.includes(decoded.userId)) {
      trip.participants.push(decoded.userId);
      await trip.save();
    }

    res.json({ 
      success: true, 
      trip: await Trip.findById(trip._id).populate('participants')
    });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid or expired token" });
  }
});


app.get('/trips/:tripId', authenticateToken, async (req, res) => {
  try {
      const trip = await Trip.findById(req.params.tripId)
          .populate('creator', 'name email')
          .populate('participants', 'name email')
          .populate({
              path: 'transactions',
              options: { sort: { createdAt: -1 } }, // Newest first
              populate: [
                { 
                  path: 'payer',
                  model: 'mongosu', // Make sure this is your actual User model name
                  select: 'name email'
                },
                { 
                  path: 'shares.user',
                  model: 'mongosu', // Make sure this is your actual User model name
                  select: 'name email'
                }
              ]
          });

      if (!trip) {
          return res.status(404).json({ success: false, message: 'Trip not found' });
      }

      if (!trip.participants.some(p => p._id.toString() === req.user.id)) {
          return res.status(403).json({ success: false, message: 'Not authorized for this trip' });
      }

      // Get detailed balance information for each participant
      const participantBalances = {};
      
      trip.participants.forEach(participant => {
          // Calculate balances for each participant
          const balanceSheet = calculateBalances(trip.transactions, participant._id);
          participantBalances[participant._id.toString()] = balanceSheet;
      });

      // Get the balance sheet for the current user
      const userBalanceSheet = calculateBalances(trip.transactions, req.user.id);

      res.json({ 
          success: true, 
          trip, 
          userBalanceSheet,
          participantBalances
      });

  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});






app.post('/transactions', authenticateToken, async (req, res) => {
  try {
      const { tripId, amount, description, shares,billUrl } = req.body;

      const trip = await Trip.findById(tripId);
      if (!trip) {
        return res.status(404).json({ 
          success: false, 
          message: "Trip not found" 
        });
      }
  
      // Authorization check - only check if user is a participant
      if (!trip.participants.includes(req.user.id)) {
        return res.status(403).json({ 
          success: false, 
          message: "Only trip participants can add transactions" 
        });
      }
      
      // Remove the trip creator restriction for first transaction
      // This allows any participant to add transactions

      // Convert shares to numbers and validate
      const shareEntries = Object.entries(shares).map(([userId, amount]) => ({
          user: userId,
          amount: Number(amount)
      }));

      // Calculate total shares
      const totalShares = shareEntries.reduce((sum, share) => sum + share.amount, 0);
      
      if (Math.abs(totalShares - Number(amount)) > 0.01) { // Allow small floating point differences
          return res.status(400).json({
              success: false,
              message: `Sum of shares (${totalShares}) does not match transaction amount (${amount})`
          });
      }

      const transaction = await Transaction.create({
          trip: tripId,
          amount: Number(amount),
          description,
          payer: req.user.id,
          shares: shareEntries,
          billUrl 
      });

      await Trip.findByIdAndUpdate(tripId, { $push: { transactions: transaction._id } });

      // Return populated transaction for better client-side handling
      const populatedTransaction = await Transaction.findById(transaction._id)
        .populate('payer', 'name email')
        .populate('shares.user', 'name email');

      res.status(201).json({ success: true, transaction: populatedTransaction });

  } catch (error) {
      console.error(error);
      res.status(500).json({ 
          success: false, 
          message: error.message
      });
  }
});







app.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.query;
    
    if (!tripId) {
      return res.status(400).json({
        success: false,
        message: "Trip ID is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: `Invalid Trip ID format: "${tripId}" (length: ${tripId.length})`
      });
    }



    // Find trip to verify user is a participant
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found"
      });
    }




    // if (!trip.participants.includes(req.user.id)) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Not authorized to view this trip"
    //   });
    // }




// After (fixed)
const isParticipant = trip.participants.some(
  participant => participant.toString() === req.user.id
);
if (!isParticipant) {
  return res.status(403).json({
    success: false,
    message: "Not authorized to view this trip"
  });
}







    // Fetch transactions for this trip
    const transactions = await Transaction.find({ trip: tripId })
      .populate('payer', 'name email')
      .populate('shares.user', 'name email')
      .sort({ createdAt: -1 });

    // Get total owed and owned amounts for the current user in this trip
    const userTransactions = {
      youOwe: [],
      youAreOwed: []
    };

    transactions.forEach(transaction => {
      const payerId = transaction.payer._id.toString();
      const isCurrentUserPayer = payerId === req.user.id;
      
      // Process each share in the transaction
      transaction.shares.forEach(share => {
        const shareUserId = share.user._id.toString();
        
        if (isCurrentUserPayer && shareUserId !== req.user.id) {
          // Current user paid, so they are owed by others
          userTransactions.youAreOwed.push({
            transactionId: transaction._id,
            description: transaction.description,
            date: transaction.createdAt,
            userOwed: share.user,
            amount: share.amount,
            status: 'pending' // You might want to add a status field to your model
          });
        } else if (!isCurrentUserPayer && shareUserId === req.user.id) {
          // Current user didn't pay, but has a share, so they owe the payer
          userTransactions.youOwe.push({
            transactionId: transaction._id,
            description: transaction.description,
            date: transaction.createdAt,
            userToPayBack: transaction.payer,
            amount: share.amount,
            status: 'pending'
          });
        }
      });
    });

    res.json({
      success: true,
      transactions,
      userTransactions
    });
    
  } catch (error) {
    console.error('Error fetching transactions:', error);
    let message = 'Error fetching transactions';
    
    if (error.name === 'CastError') {
      message = `Invalid ID format: ${error.value}`;
    }
    
    res.status(500).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});




app.post('/payments', authenticateToken, async (req, res) => {
  try {
    const { transactionId, amount } = req.body;
    
    if (!transactionId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID and amount are required"
      });
    }

    // In a real app, you would process the payment here
    // and update the transaction status

    // For now, just return a success response
    res.json({
      success: true,
      message: "Payment processed successfully"
    });
    
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment'
    });
  }
});




app.delete('/payments', authenticateToken, async (req, res) => {
  try {
    const { transactionId } = req.body;
    
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required"
      });
    }

    // Find the transaction and populate necessary data
    const transaction = await Transaction.findById(transactionId)
      .populate('payer', '_id')
      .populate('shares.user', '_id');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }

    // Get current user ID
    const currentUserId = req.user.id;

    // Verify user is part of the transaction
    const isPayer = transaction.payer._id.toString() === currentUserId;
    const isParticipant = transaction.shares.some(share => 
      share.user._id.toString() === currentUserId
    );

    if (!isPayer && !isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this transaction"
      });
    }

    // Delete the transaction
    await Transaction.findByIdAndDelete(transactionId);

    // Remove from trip's transactions array
    await Trip.findByIdAndUpdate(transaction.trip, {
      $pull: { transactions: transactionId }
    });

    res.json({
      success: true,
      message: "Payment recorded and transaction removed successfully"
    });

  } catch (err) {
    console.error('Error deleting payment:', err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});









// Add this route to get user balances
app.get('/user/balances', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all trips the user is part of
    const userTrips = await Trip.find({ participants: userId }).select('_id');
    const tripIds = userTrips.map(trip => trip._id);

    // Find all relevant transactions
    const transactions = await Transaction.find({
      trip: { $in: tripIds },
      $or: [
        { payer: userId },
        { 'shares.user': userId }
      ]
    }).populate('shares.user', '_id');

    let totalOwed = 0;  // User owes others
    let totalOwned = 0; // Others owe user

    transactions.forEach(transaction => {
      // Convert payer to string for comparison
      const payerId = transaction.payer.toString();
      
      if (payerId === userId) {
        // User is the payer - sum all shares except self
        transaction.shares.forEach(share => {
          if (share.user._id.toString() !== userId) {
            totalOwned += share.amount;
          }
        });
      } else {
        // User is in shares - find their share amount
        const userShare = transaction.shares.find(share => 
          share.user._id.toString() === userId
        );
        if (userShare) totalOwed += userShare.amount;
      }
    });

    const netBalance = totalOwned - totalOwed;

    res.json({
      success: true,
      balances: {
        youOwe: parseFloat(totalOwed.toFixed(2)),
        youAreOwed: parseFloat(totalOwned.toFixed(2)),
        netBalance: parseFloat(netBalance.toFixed(2))
      }
    });

  } catch (error) {
    console.error('Balance calculation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error calculating balances' 
    });
  }
});

app.get('/user/trips', authenticateToken, async (req, res) => {
  try {
    const trips = await Trip.find({ participants: req.user.id })
      .select('name _id createdAt')
      .populate('participants', 'name email');
      
    res.json({ success: true, trips });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



function authenticateToken(req, res, next) {
  console.log("Request Headers:", req); // Log headers for debugging

    let token = req.cookies?.accesstoken;

     // If not in cookies, check Authorization header (for API requests)
     if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.split(' ')[1];
      }
  }
  
  // If still no token, check query string (less secure but useful for debugging)
  if (!token && req.query.token) {
      token = req.query.token;
  }
  
  console.log("Token used:", token ? "Present" : "Not found");

  if (!token) return res.status(401).json({ message: "Unauthorized - No token provided", success: false });


  verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token", success: false });
    req.user = { id: decoded.id };
    next();
    });
}




const sendTripInvitations = async (trip, creator, participants) => {
  try {
    await Promise.all(participants.map(async (participant) => {
      const invitationToken = sign(
        { tripId: trip._id, userId: participant._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '7d' }
      );

      const invitationLink = `${process.env.CLIENT_URL}/join-trip/${trip._id}?token=${invitationToken}`;

      await transporter.sendMail({
        from: `TravFin <${process.env.EMAIL_USER}>`,
        to: participant.email,
        subject: `Join Trip: ${trip.name}`,
        html: `
          <h3>You've been invited to join "${trip.name}"</h3>
          <p>Click the link below to join the trip:</p>
          <a href="${invitationLink}">Join Trip</a>
          <p>This link will expire in 7 days</p>
        `
      });
    }));
  } catch (error) {
    console.error('Error sending invitations:', error);
  }
};










async function sendInvitationEmail(senderName, recipientEmail) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `Join ${senderName}'s Travel Finance Group`,
      html: `<p>You've been invited to join ${senderName}'s travel finance group!</p>
            <p>Click here to register: <a href="${process.env.APP_URL}/register">Join Now</a></p>`
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send invitation email');
  }
}




function calculateBalances(transactions, currentUserId) {
  const balanceSheet = {};

  if (!transactions || !Array.isArray(transactions)) {
    console.error('Invalid transactions data:', transactions);
    return {
      individual: [],
      totalOwed: 0,
      totalOwned: 0,
      netResult: 0
    };
  }

  transactions.forEach(transaction => {
    try {
      // Safely get payer ID
      const payerId = transaction.payer?._id?.toString() || transaction.payer?.toString();
      
      if (!payerId) {
        console.error('Invalid transaction - missing payer:', transaction);
        return;
      }

      if (!transaction.shares || !Array.isArray(transaction.shares)) {
        console.error('Invalid transaction - missing shares array:', transaction);
        return;
      }

      transaction.shares.forEach(share => {
        try {
          // Safely get share user ID
          const shareUserId = share.user?._id?.toString() || share.user?.toString();

          if (!shareUserId) {
            console.error('Invalid share - missing user:', share);
            return;
          }

          const shareAmount = Number(share.amount) || 0;

          if (shareUserId !== payerId) {
            // The user who's part of the share owes the payer
            balanceSheet[shareUserId] = (balanceSheet[shareUserId] || 0) - shareAmount;
            // The payer is owed by the user who's part of the share
            balanceSheet[payerId] = (balanceSheet[payerId] || 0) + shareAmount;
          }
        } catch (shareError) {
          console.error('Error processing share:', share, shareError);
        }
      });
    } catch (transactionError) {
      console.error('Error processing transaction:', transaction, transactionError);
    }
  });

  // Format the result
  const result = {
    individual: [],
    totalOwed: 0,
    totalOwned: 0,
    netResult: 0
  };

  // Format individual balances and convert currentUserId to string for comparison
  const currentUserIdStr = currentUserId?.toString();

  Object.entries(balanceSheet).forEach(([userId, balance]) => {
    if (userId === currentUserIdStr) return;

    // Find user details safely - first look in payers, then in shares
    let userName = 'Unknown';
    let userFound = false;

    for (const t of transactions) {
      // Check if this user is a payer in any transaction
      if ((t.payer?._id?.toString() === userId || t.payer?.toString() === userId) && t.payer?.name) {
        userName = t.payer.name;
        userFound = true;
        break;
      }
      
      // Check if this user is in shares in any transaction
      if (t.shares && Array.isArray(t.shares)) {
        for (const s of t.shares) {
          if ((s.user?._id?.toString() === userId || s.user?.toString() === userId) && s.user?.name) {
            userName = s.user.name;
            userFound = true;
            break;
          }
        }
        if (userFound) break;
      }
    }

    const owed = Math.max(0, -balance);
    const owned = Math.max(0, balance);

    result.individual.push({
      userId,
      name: userName,
      owed: parseFloat(owed.toFixed(2)),
      owned: parseFloat(owned.toFixed(2))
    });
  });

  result.totalOwed = parseFloat(result.individual.reduce((sum, b) => sum + b.owed, 0).toFixed(2));
  result.totalOwned = parseFloat(result.individual.reduce((sum, b) => sum + b.owned, 0).toFixed(2));
  result.netResult = parseFloat((result.totalOwned - result.totalOwed).toFixed(2));

  return result;
}

// Existing routes (retained from your code)
app.get("/getmyprofile", authenticateToken, async (req, res) => {
    try {
        const founduser = await User.findById(req.user.id);
        if (!founduser) return res.status(404).json({ success: false, message: "User not found" });
        
        res.status(200).json({ 
            success: true, 
            user1: founduser.name, 
            detail1: founduser.email,
            token: req.user.token
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


app.post('/forgotpassword', async (req, res) => {
  try {
      const { email, password } = req.body;

      // Find user by email
      const existingUser = await User.findOne({ email });

      if (!existingUser) {
          return res.status(404).json({ success: false, message: "User not found" });
      }

      // Update password directly in the database
      await User.updateOne(
          { email: email }, // Filter by email
          { $set: { password: password } } // Update password field
      );

      // Send success response
      res.status(200).json({ success: true, message: "Password updated successfully" });
      
  } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post('/logout', (req, res) => {
    res.clearCookie("accesstoken");
    res.clearCookie("refreshToken");
    res.json({ success: true, message: "Logged out successfully" });
});

const port = process.env.PORT || 3500;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
export default app; // Export the app for testing purposes  
























