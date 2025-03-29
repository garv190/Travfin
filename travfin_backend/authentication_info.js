// if i want a pizza, i gave an order (order api)  counter willl give token to order placer

//when sign in a token is sent as a response , then we have to verify token before taking order
//token contains information about user, name and details aabout the user. to verify whether it is legit or not

//Another example could be parking lot in malls when a user come in parking to park it vehicle then in such a case a token is generated for a new user that contains information about user 
//later that token is verified and further transferred.

//example while registering we will be sending name profile picture email etc

//login ==>username and password ==>for wrong response will be recieved is wrong

//if correct info then 2 things will be done a response "logged in" and token is generated

//token==> header payload and signature  payload contains user data

//token is stored in cookies in web browser hence we do not need to reload again and again.

//again if we make a request to get user data then we will send token to backend 

//through backend we can verify the token send from frontend 

//FOR ACCESS TOKEN WE SEND REQUEST BY Bearer 

// WHEN TOKEN ARE VERIFIED THEY ARE STORED IN COOKIES

//WHEN TOKEN EXPIRES THEN A NEW TOKEN SHOULD BE REISSUED TO GET A NEW TOKEN THIS TOKEN IS CALLED AS REFRESH TOKENS

//along with access token a refresh token is generated simultenously 
//importance of refresh token is when main token expires then there is no need to authenticate token once more 

// refresh token is availaoble till new token is generated again.


//when a refresh token is generated along with access token, suppose access token has life of 15 minutes along with it a refresh token is generated

//refresh token generates a new access token along with refresh token because refresh token can be also hacked hence new refresh token is also generated.

//REFRESH TOKEN IS STORED IN COOKIES. --->IMPORTANT 

//ACCESS TOKEN--->MACHINE


//IF AT EXPIRES THEN WE WILL GO TO req.cookies if it has refresh token then new access token is generated along with new refresh token


//WHEN WE USE jwt.sign it means that we are creating a token with payload signature and header that stores info about login 
//backend info is verified through help of tokens

//this refresh token is stored in form of cookies

//we extract data (payload) assigned to tokens through verify command.




// 🔹 How JWT with Refresh Tokens Works
// User logs in → Server generates Access Token & Refresh Token.

// Access Token expires (after 15 mins).

// User sends Refresh Token → Server verifies it and issues a new Access Token.

// If Refresh Token expires, user must log in again.











// 🔥 Breakdown: JWT + Cookies Flow
// 1️⃣ Why & Where Are We Signing JWTs?
// When? → During login (/login route).

// Why? → To create a secure session for the user without storing sensitive data on the server.

// How? → Using jwt.sign(), we generate a token with { id: user._id } inside.

// Where? → We store the token in an HTTP-only cookie for security.

// 2️⃣ Where & Why Do We Verify JWTs?
// Where? → Inside verifyToken middleware.

// Why? → To check if the user is authenticated before allowing access to protected routes.

// How? → We extract the JWT from cookies and verify it using jwt.verify().

// Then? → If valid, we attach req.userId and allow access to protected routes.

// 3️⃣ Where Are Cookies Used & Why?
// Where? → Cookies store the JWT after login.

// Why?

// Persistence: Cookies remain in the browser even after refreshing the page.

// Security: HTTP-only cookies prevent access to the token via JavaScript (protection against XSS attacks).

// Convenience: The client doesn't need to manually send the token in headers every time.

// 4️⃣ When Will You Need JWT & Cookies?
// During Login → To generate & store JWT in a cookie.

// On Protected Routes → To check if a user is logged in before allowing access.

// During Logout → To clear the cookie and remove authentication.

// 🔥 Real-World Use Case:
// User Logs In → Server generates JWT & stores it in a cookie.

// User Visits a Protected Page (/dashboard) → Browser automatically sends the cookie → Server verifies JWT → Grants access.

// User Logs Out → Cookie is cleared, and the user is no longer authenticated.











// 💡 Key Takeaways
// ✅ Without /getmyprofile, user data is lost on refresh.
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

// Let me know if anything is unclear! 🚀🔥








