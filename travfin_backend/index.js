const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
require('dotenv').config();
const TempUser = require('./MODELS/tempuser');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const Trip = require('./MODELS/Trip');
const Transaction = require('./MODELS/Transaction');
const User = require('./MODELS/s'); // Assuming this is your User model
require('./db');

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(bodyParser.json());
app.use(cookieParser());

const transporter = nodemailer.createTransport({
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
            User.findOne({ email }),
            TempUser.findOne({ email })
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

        const otp = otpGenerator.generate(6, {
            upperCase: false,
            specialChars: false,
            alphabets: false
        });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

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

        const isPasswordCorrect = await bcrypt.compare(password, existinguser.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid password" });

        const accesstoken = jwt.sign(
            { id: existinguser._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "2h" }
        );

        const refreshtoken = jwt.sign(
            { id: existinguser._id },
            process.env.JWT_REFRESH_SECRET_KEY,
            { expiresIn: "7d" }
        );

        existinguser.refreshtoken = refreshtoken;
        await existinguser.save();

        res.cookie("accesstoken", accesstoken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            path: "/"
        });

        res.cookie("refreshToken", refreshtoken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
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




app.post('/trips/:tripId/join', async (req, res) => {
  try {
    const token = req.query.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
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
                populate: [
                    { path: 'payer', select: 'name email' },
                    { path: 'shares.user', select: 'name email' }
                ]
            });

        if (!trip.participants.some(p => p._id.equals(req.user.id))) {
            return res.status(403).json({ success: false, message: 'Not authorized for this trip' });
        }

        const balanceSheet = calculateBalances(trip.transactions);
        res.json({ success: true, trip, balanceSheet });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});




// app.post('/transactions', authenticateToken, async (req, res) => {
//     try {
//         const { tripId, amount, description, shares } = req.body;

//         const transaction = await Transaction.create({
//             trip: tripId,
//             amount,
//             description,
//             payer: req.user.id,
//             shares: Object.entries(shares).map(([userId, amount]) => ({
//                 user: userId,
//                 amount
//             }))
//         });

//         await Trip.findByIdAndUpdate(tripId, { $push: { transactions: transaction._id } });

//         res.status(201).json({ success: true, transaction });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: 'Server error' });
//     }
// });







app.post('/transactions', authenticateToken, async (req, res) => {
  try {
      const { tripId, amount, description, shares } = req.body;

      // Convert shares to numbers and validate
      const shareEntries = Object.entries(shares).map(([userId, amount]) => ({
          user: userId,
          amount: Number(amount)
      }));

      // Calculate total shares
      const totalShares = shareEntries.reduce((sum, share) => sum + share.amount, 0);
      
      if (totalShares !== Number(amount)) {
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
          shares: shareEntries
      });

      await Trip.findByIdAndUpdate(tripId, { $push: { transactions: transaction._id } });

      res.status(201).json({ success: true, transaction });

  } catch (error) {
      console.error(error);
      res.status(500).json({ 
          success: false, 
          message: error.message // Now shows the validation error clearly
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







// Helper functions (retained and updated)
function authenticateToken(req, res, next) {
    const token = req.cookies?.accesstoken;
    if (!token) return res.status(401).json({ message: "Unauthorized", success: false });

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid token", success: false });
        req.user = { id: decoded.id };
        next();
    });
}

const sendTripInvitations = async (trip, creator, participants) => {
  try {
    await Promise.all(participants.map(async (participant) => {
      const invitationToken = jwt.sign(
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

function calculateBalances(transactions) {
    return transactions.reduce((acc, transaction) => {
        transaction.shares.forEach(share => {
            if (!share.user.equals(transaction.payer._id)) {
                acc[share.user] = (acc[share.user] || 0) + share.amount;
                acc[transaction.payer._id] = (acc[transaction.payer._id] || 0) - share.amount;
            }
        });
        return acc;
    }, {});
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
























