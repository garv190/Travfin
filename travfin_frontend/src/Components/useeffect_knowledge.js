// 💡 Why Use useEffect?
// Ensures the user data is fetched only once when the page loads.

// Avoids unnecessary API calls on every render.

// Helps maintain a reactive UI—if a user is logged in, their first letter appears in the avatar.



// 🚀 What Happens Without useEffect?
// The API call would not run automatically when the component loads.

// If placed directly in the component body, it would trigger on every re-render, causing infinite requests.



// 🔹 What Does [] in useEffect Mean?
// In React, the useEffect hook controls when and how a side effect (like an API call) runs in a component. The [] (empty dependency array) determines when the effect should execute.







// 📌 Understanding the Dependency Array ([])
// js
// Copy
// Edit
// useEffect(() => {
//   console.log("Effect is running...");
// }, []);
// Here, [] (empty array) means: ✅ The effect runs only once, when the component mounts (first time it appears on the screen).
// 🚫 It does not run again on re-renders.




// 💡 Example: Without [] (Runs on Every Render)
// js
// Copy
// Edit
// useEffect(() => {
//   console.log("Effect running on every render...");
// });
// 🔄 This runs every time the component re-renders, which can cause performance issues if not handled properly.




// 💡 Example: With a Dependency (Runs When userId Changes)
// js
// Copy
// Edit
// useEffect(() => {
//   console.log("Effect runs when userId changes...");
// }, [userId]);
// ✅ This runs when userId changes, making it useful for updating data dynamically.

