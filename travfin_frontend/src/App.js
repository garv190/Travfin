// import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Nav from "./Components/navbar"
import  Drawer from "./Components/drawer"
import Signup from "./Components/signup"
import Signin from "./Components/signin"
import OTPVerification from "./Components/OTPVerification"
import Passwordverification from "./Components/forgot_password"

// import { useState,useEffect } from 'react';
// import Footer from "./Components/footer"
// import Footer from "./Components/footer"

function App() {

 

  // Fetch user profile on page load

  

  // Problem Without /getmyprofile
  // When a user logs in, you get the user’s details from the /signin response.
  
  // But if the user refreshes the page, the user state resets in React, and you lose user data.
  
  // The cookies still store the access token, but React doesn’t automatically retrieve it.
  
  // 💡 Solution?
  // Use /getmyprofile to fetch user data from the backend whenever the page reload



//   ✅ Without /getmyprofile, user data is lost on refresh.
// ✅ With /getmyprofile, user stays logged in even after refresh.
// ✅ Middleware (authenticateToken) ensures user is authenticated before fetching profile.



// 🚀 Full Authentication Flow With /getmyprofile
// ✅ When User Logs In (/signin)
// Backend stores token in cookies.

// Frontend sets user state and redirects to Dashboard.

// ✅ When Page Refreshes (/getmyprofile)
// Frontend calls /getmyprofile.

// Backend validates token & sends back user details.

// Frontend restores user state.

// Without /getmyprofile, user data is lost on refresh.
// ✅ With /getmyprofile, user stays logged in even after refresh.
// ✅ Middleware (authenticateToken) ensures user is authenticated before fetching profile.








  // useEffect(() => {
  //     const fetchProfile = async () => {
  //         const response = await fetch("http://localhost:3500/getmyprofile", { credentials: "include" });
  //         const data = await response.json();
  //         if (data.success) {
  //             setUser(data.user);
  //         }
  //     };

  //     fetchProfile();
  // }, []);







  return (
    <Router>
     
      <div>
      <Nav/>
      <Routes>
     
        <Route path="/" element={
          
          
          <>
          
          
          <Drawer/>
          </>
          } />
     
       
     <Route path="/signup" element={<Signup/>}></Route>

     <Route path="/signin" element={<Signin/>}></Route>

     <Route path="/verify-otp" element={<OTPVerification/>}></Route>

     <Route path="/forgotpassword" element={<Passwordverification/>}></Route>

     <Route path="/profile" element={<Drawer/>}></Route>

     

     {/* <Route path="/myprofile" element={<Footer/>}></Route> */}


     
      {/* <Footer/> */}


      </Routes>
      </div>
    </Router>
  );
}

export default App;
