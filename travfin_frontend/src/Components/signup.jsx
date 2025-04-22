import { useState, useEffect } from "react";
import { TextField, Button, Card, CardContent, Typography, Box, Grid, Checkbox, FormControlLabel } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";

const SignUp = () => {
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    confirmpassword: "" 
  });

  useEffect(() => {
    setFormData({ name: "", email: "", password: "", confirmpassword: "" });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmpassword) {
      alert("Please fill in all fields before submitting.");
      return;
    }

    if (formData.password !== formData.confirmpassword) {
      alert("Passwords don't match!");
      return;
    }
  
    submitform();
  };

  const submitform = () => {
    fetch(`${process.env.REACT_APP_URL}/signup`, {
      method: 'POST',
      credentials: 'include', 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Verify E-Mail through OTP sent to your email id ");
        navigate('/verify-otp', { state: { email: formData.email } });
      } else {
        alert(data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert("An error occurred during signup.");
    });
  };

  const navigate = useNavigate();

  return (
    <Box 
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: 2
      }}
    >
      <Card 
        sx={{
          width: '100%',
          maxWidth: 450,
          padding: 3,
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        <CardContent>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{
              textAlign: 'center',
              fontWeight: 'bold',
              color: 'text.primary',
              mb: 2
            }}
          >
            Sign Up
          </Typography>
          <Typography 
            variant="body1" 
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              mb: 4
            }}
          >
            Welcome! Create an account to continue.
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Grid item xs={12}>
                <TextField
                  label="Full Name *"
                  variant="outlined"
                  fullWidth
                  size="medium"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email *"
                  variant="outlined"
                  fullWidth
                  size="medium"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Password *"
                  variant="outlined"
                  fullWidth
                  size="medium"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Confirm Password *"
                  variant="outlined"
                  fullWidth
                  size="medium"
                  name="confirmpassword"
                  type="password"
                  value={formData.confirmpassword}
                  onChange={handleChange}
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox color="primary" required />}
                  label="I agree to the terms & conditions *"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  sx={{
                    width: '100%',
                    maxWidth: '400px',
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    borderRadius: 1
                  }}
                >
                  SIGN UP
                </Button>
              </Grid>
            </Grid>
          </form>
          <Typography 
            variant="body2" 
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              mt: 3
            }}
          >
            Already have an account?{" "}
            <Link 
              to="/signin" 
              style={{
                color: '#1976d2',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              Sign In
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SignUp;






















// import { useState,useEffect } from "react";
// import { TextField, Button, Card, CardContent, Typography, Box, Grid, Checkbox, FormControlLabel } from "@mui/material";
// import { useNavigate,Link } from "react-router-dom";


// //IMPORTANT ^^^^^^^^^====> IN FRONTENRND NAME FIELD IS RESPONSIBLE TO MATCH WITH USESTATE FIELD

// const SignUp = () => {
//   const [formData, setFormData] = useState({ name: "", email: "", password: "" ,confirmpassword:""});



//   useEffect(() => {
//     // Clear form fields when the component mounts (i.e., on page reload)
//     setFormData({ name: "", email: "", password: "",confirmpassword:"" });
//   }, []);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // const handleSubmit = (e) => {
//   //   e.preventDefault();
//   //   console.log(formData);
//   // };

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     // Check if any field is empty
//     if (!formData.name || !formData.email || !formData.password||!formData.confirmpassword) {
//       alert("Please fill in all fields before submitting.");
//       return;
//     }
  
//     submitform(); // Call submitform only if all fields are filled
//   };


//   // const submitform=()=>{
    
    
//   //   fetch('${process.env.REACT_APP_API_URL}/signup',{
//   //       method:'POST',
//   //       headers: {
//   //           "Content-Type": "application/json"
//   //         },
//   //         body: JSON.stringify(formData)
//   //   })

//   //   .then(res=>res.json())

//   //   .then(data=>{
//   //       if(data.success){
//   //       alert("You have been registered")
//   //       navigate("/");

//   //       }

//   //       else{
//   //         alert(data.message)
//   //       }
//   //   })
//   // }




// // In SignUp component
// const submitform = () => {
//   fetch('${process.env.REACT_APP_API_URL}/signup', {
//     method: 'POST',
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(formData)
//   })
//   .then(res => res.json())
//   .then(data => {
//     if (data.success) {
//       navigate('/verify-otp', { state: { email: formData.email } });
//     } else {
//       alert(data.message);
//     }
//   });
// };








//   const navigate = useNavigate(); // Initialize navigate function
//   return (
//     <Box className="flex justify-center items-center min-h-screen bg-slate-600">
//       <Card className="w-full max-w-sm p-6 shadow-lg rounded-lg bg-white">
//         <CardContent>
//           <Typography variant="h5" className="text-center font-bold text-gray-700 mb-2">
//             Sign Up
//           </Typography>
//           <Typography className="text-center text-gray-500 mb-4">
//             Welcome! Create an account to continue.
//           </Typography>
//           <form onSubmit={handleSubmit}>
//             <Grid container spacing={1} content-center>
//               <Grid item xs={12}>
//                 <TextField
//                   label="Full Name"
//                   variant="outlined"
//                   fullWidth
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   label="Email"
//                   variant="outlined"
//                   fullWidth
//                   name="email"
//                   type="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   label="Password"
//                   variant="outlined"
//                   fullWidth
//                   name="password"
//                   type="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   required
//                 />
//               </Grid>

//               <Grid item xs={12}>
//                 <TextField
//                   label="Confirm Password"
//                   variant="outlined"
//                   fullWidth
//                   name="confirmpassword"
//                   type="password"
//                   value={formData.confirmpassword}
//                   onChange={handleChange}
//                   required
//                 />
//               </Grid>





//               <Grid item xs={12}>
//                 <FormControlLabel
//                   control={<Checkbox color="primary" />}
//                   label="I agree to the terms & conditions"
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <Button type="submit" variant="contained" color="primary" fullWidth >
//                   Sign Up
//                 </Button>
//               </Grid>
//             </Grid>
//           </form>
//           <Typography className="text-center text-gray-600 mt-4">
//             Already have an account?{" "}
//             <Link to="/signin" className="text-blue-500 hover:underline">
//               Sign In
//             </Link>
//           </Typography>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// };

// export default SignUp;
