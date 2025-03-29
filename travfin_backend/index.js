const express=require('express')
const app=express()
const cors=require('cors')
const bodyparser=require('body-parser')
const jwt=require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const bcrypt=require('bcrypt')
require('dotenv').config()
const TempUser = require('./MODELS/tempuser');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');

require('./db')



app.use(cors({
    origin: "http://localhost:3000",  // Change this to your frontend URL
    credentials: true
}));

app.use(bodyparser.json())
app.use(cookieParser())

// const user=require('./MODELS/Signupform')

const user=require('./MODELS/s')

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });










app.get('/',(req,res)=>{
    res.json({
        message:"Welcome to this page"
    })
})

app.post('/signup',async (req,res,next)=>{
    
    try{
    
    const {name, email,password,confirmpassword}=req.body



    // const existinguser=await user.findOne({email})


    // Check existing users in both collections
    const [existingUser, existingTempUser] = await Promise.all([
        user.findOne({ email }),
        TempUser.findOne({ email })
      ]);
  

    // if(existinguser){
    //     return res.json({success:false,
    //         message:"User already exists"})
    // }


    if (existingUser || existingTempUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists or verification pending"
        });
      }






    if(password!=confirmpassword){
        return res.status(400).json({success:false,
            message:"password and confirm password do not match"
        })
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

    // const new_user= new user({name,email,password:hash})
   

    // await new_user.save();

    

    // return res.json({success:true})

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




    
}

catch(err){
    console.log(err)
}
next();
})








app.post('/verify-otp', async (req, res) => {
    try {
      const { email, otp } = req.body;
  
      // Find temp user
      const tempUser = await TempUser.findOne({ email });
      
      if (!tempUser) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP or email"
        });
      }
  
      // Verify OTP
      if (tempUser.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP"
        });
      }
  
      // Create permanent user
      const newUser = new user({
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
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  });

















//to login and check whether user was authentic or not

app.post('/signin', async (req,res)=>{
    try{
        const{email,password}=req.body
        const existinguser=await user.findOne({email})

        if(!existinguser){
          console.log("does not exist");
            return res.json({message:"User does not exist"})
            
        }

        //if user exists then there is need to authenticate user and for that access token need to be generated and verified 

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
            {expiresIn: "7d" }
           
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

        res.status(200).json({ success:true, 
          accesstoken, 
          refreshtoken, 
          message: "User is logged in",
          user: {
            id: user._id,
            name: user.name,
            email: user.email
          } });
        // console.log(accesstoken, refreshtoken)
    }

    catch(err){
        console.log(err)
    }
})



app.get("/getmyprofile", authenticateToken, async (req, res) => {
    try {
        const founduser = await user.findById(req.userId); // Use userId from middleware
        if (!founduser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        // Send user data once
        res.status(200).json({ 
            success: true, 
            user1: founduser.name, 
            detail1: founduser.email ,
            token: req.userToken     //token can also be send in return
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
        const existingUser = await user.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Update password directly in the database
        await user.updateOne(
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



// app.get("/getmyprofile", authenticateToken, async (req, res) => {

//     try{
//     const founduser = await user.findById(req.userId);
//     if (!founduser) return res.status(404).json({success:false });
//     const { name, email, age } = req.user; // Extract user details
//      res.status(200).json({ success:true , user1:name, detail1:email});
//     res.status(200).send("Hello World")
   

//     // user.password = undefined;
   
//     }

   
//     catch(err){

//        console.log(err)
//     }
// });


// function authenticateToken(req, res, next) {
//     const token = req.cookies.accessToken;
//     if (!token) {
//         return res.status(400).json({message:"User not found",success:false})
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//         req.userId = decoded.id;
//         return res.status(200).json({success:true, })
//         next();
//     } catch (error) {
//         next(error);
//     }
// }


function authenticateToken(req, res, next) {
    const token = req.cookies.accesstoken; // Match frontend cookie name (lowercase)
    if (!token) {
        return res.status(401).json({ message: "Unauthorized", success: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.userId = decoded.id; // Attach user ID to request
        req.userToken = token; 
        next(); // Proceed to route handler
    } catch (error) {
        return res.status(403).json({ message: "Invalid token", success: false });
    }
}




app.post("/logout", (req, res) => {
    res.clearCookie("accesstoken");
    res.clearCookie("refreshtoken");
    console.log("Cleared Cookies")
    res.json({ success: true, message: "Logged out successfully" });
});



//SPLITWISE LOGIC STARTS FROM HERE...........

app.post("/expense",async (req,res)=>{

})














const port=process.env.PORT

app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
})