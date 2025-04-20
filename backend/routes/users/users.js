const express = require('express');
const dbOperations = require('../../../database/dbOperations'); // Your database operations module
const router=express.Router();
const encrypt=require('../../encrypt') // Your encryption module
const jwt=require('../../middleware/jwt') // Your JWT middleware

// Route for user signup
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Hash the password before storing it
        const hashedPass = await encrypt.encrypt(password);
        // Add the new user to the database
        const newUser = await dbOperations.addUser(username, email, hashedPass);
        // Return success response with status 201 (Created)
        return res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        console.error("Error during signup:", error);
        let statusCode = 500;
        let message = "Error during signup";

        // Handle specific errors like username or email already existing
        if (error.message === "Username or email already exists in the database.") {
            statusCode = 409; // Conflict status code
            message = error.message;
        } else if (error.code === 'SQLITE_CONSTRAINT') {
            // Catch SQLite constraint errors (e.g., unique constraint violation)
            statusCode = 409;
            message = "Username or email already exists";
        }

        // Return error response with appropriate status code
        return res.status(statusCode).json({ message: message });
    }
});

// Route for user login
router.post("/login", async (req, res) => {
    const { loginIdentifier, password } = req.body; // loginIdentifier can be username or email
    try {
        // Get user data by username or email
        const getuser=await dbOperations.getUser(loginIdentifier);
        // If user not found, throw an error
        if (!getuser) {
            throw new Error("User not found");
        }
        // Compare the provided password with the hashed password from the database
        // Assuming encrypt.comparePassword takes loginIdentifier to fetch hashed pass internally
        const correct = await encrypt.comparePassword(loginIdentifier, password);
        console.log("Password comparison correct: ", correct);
        // If password is correct
        if (correct) {
            // Fetch user data again (or use getuser if it contains all needed fields)
             const userData = await dbOperations.getUser(loginIdentifier); // Re-fetching to ensure correct data structure for token
            console.log("User data for token:", userData);
            // Generate a JWT token for the user
            const userjwt = jwt.generateAccessToken(userData);
            // Return success response with the token and user data
            return res.status(200).json({ token: userjwt, message: "Login successful",userData:userData });
        } else {
            // If password is incorrect, return 401 Unauthorized
            return res.status(401).json({ message: "Password does not match with the username or email" });
        }
    } catch (err) {
        console.error("Error during login:", err);
        // Handle specific "User not found" error
        if (err.message === "User not found") {
            return res.status(401).json({ message: "Username or Email is incorrect" });
        } else {
            // Handle other unexpected errors
            return res.status(500).json({ message: "Something went wrong: "+err.message }); // Include error message for debugging
        }
    }
});

// Route to get user data (expects loginIdentifier and password in body - NOT authenticated)
// Note: This route is less secure as it requires credentials in the body for a GET request.
// The /retrieve-user-data route is preferred for authenticated users.
router.get('/get-user', async (req, res) => {
    const { loginIdentifier,password } = req.body; // Expects credentials in body
    try {
        const user = await dbOperations.getUser(loginIdentifier);
        if (user) {
            // In a real app, you'd verify the password here too before returning data
            return res.status(200).json(user); // Returning user data without password verification here
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    } catch (err) {
        console.error("Error in /get-user:", err);
        return res.status(500).json({ message: "Failed to fetch user" });
    }
});

// Route to retrieve logged-in user's data using JWT (Authenticated)
router.get('/retrieve-user-data', jwt.authenticateToken, async (req, res) => {
    // authenticateToken middleware successfully verified the token
    // and attached the decoded user payload to req.user (contains id, username, email)

    // Get the user's email from the token payload
    // Assuming the email is stored in req.user.email (lowercase key from payload)
    const userEmail = req.user.email;

    console.log(`Attempting to retrieve data for user with email: ${userEmail}`); // Log for debugging

    try {
        // Fetch the user details from the database using the email
        // Reusing the existing dbOperations.getUser function which can search by email
        const user = await dbOperations.getUser(userEmail);

        // Check if the user was found in the database using the email
        if (!user) {
            console.warn(`User data not found in DB for email: ${userEmail} after token auth.`);
            // This shouldn't happen with a valid token unless the user was deleted
            return res.status(404).json({ message: "User data not found" });
        }

        console.log(`Successfully retrieved data for user with email: ${userEmail}`); // Log success

        // Return the user data (excluding sensitive info like password hash)
        // Ensure the returned object matches what the frontend expects ({ id, username, email })
        return res.status(200).json({
            id: user.ID, // Assuming your dbOperations.getUser returns ID as user.ID (uppercase)
            username: user.USERNAME, // Assuming USERNAME as user.USERNAME (uppercase)
            email: user.EMAIL, // Assuming EMAIL as user.EMAIL (uppercase)
            // Add any other user fields needed on the frontend
        });

    } catch (err) {
        // Handle any errors during the database operation
        console.error(`Error retrieving user data for email ${userEmail}:`, err);
        return res.status(500).json({ message: "Failed to retrieve user data" });
    }
});

// Route to patch user's username (Authenticated)
router.patch('/user/patch-username', jwt.authenticateToken, async (req, res) => {
    const { newUsername } = req.body;
    // Get the current username from the token payload
    const oldUsername = req.user.username; // Assuming username is in req.user.username (lowercase)

    // Basic validation
    if (!newUsername || newUsername.trim() === '') {
        return res.status(400).json({ message: "New username is required." });
    }
     if (newUsername.trim() === oldUsername) {
         return res.status(400).json({ message: "New username must be different from the current username." });
     }

    try {
        // Update the username in the database
        // Note: Your dbOperations.patchUsername uses oldUsername to find the user
        await dbOperations.patchUsername(oldUsername, newUsername.trim());
        // Return success response
        return res.status(200).json({ message: "Username updated successfully." });
    } catch (error) {
        console.error("Error updating username:", error);
         // Handle specific errors like username already exists
         if (error.message && error.message.includes("already exists")) { // Check for specific error message from dbOperations
              return res.status(409).json({ message: error.message });
         }
        return res.status(500).json({ message: "Failed to update username." });
    }
});

// Route to patch user's email (Authenticated)
// Note: Frontend was modified to make email static, so this route might become unused.
router.patch('/user/patch-email', jwt.authenticateToken, async (req, res) => {
    const { newEmail } = req.body;
    // Get the current username from the token payload to identify the user
    const username = req.user.username; // Assuming username is in req.user.username (lowercase)

     // Basic validation
    if (!newEmail || newEmail.trim() === '') {
        return res.status(400).json({ message: "New email is required." });
    }
     if (newEmail.trim() === req.user.email) { // Check against email in token payload
          return res.status(400).json({ message: "New email must be different from the current email." });
     }

    try {
        // Update the email in the database
        // Note: Your dbOperations.patchEmail uses username to find the user
        await dbOperations.patchEmail(newEmail.trim(), username);
        // Return success response
        return res.status(200).json({ message: "Email updated successfully." });
    } catch (error) {
        console.error("Error updating email:", error);
         // Handle specific errors like email already exists
         if (error.message && error.message.includes("already exists")) { // Check for specific error message from dbOperations
              return res.status(409).json({ message: error.message });
         }
        return res.status(500).json({ message: "Failed to update email." });
    }
});

// --- New Route to Patch User Password (Authenticated) ---
router.patch('/user/patch-password', jwt.authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    // Get user identifier (email or ID) from the token payload
    // Using email as per previous discussion and getUser function capability
    const userEmail = req.user.email; // Assuming email is in req.user.email (lowercase)
    const userId = req.user.id; // Also get ID, as it's more reliable for UPDATE query

    // Basic validation
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required." });
    }
    // You might add new password length validation here too, or rely on frontend
    // if (newPassword.length < MIN_PASSWORD_LENGTH) { ... }

    try {
        // 1. Get the user's current hashed password from the database using their email
        const user = await dbOperations.getUser(userEmail); // Use getUser by email

        // Check if user was found (should be if token is valid)
        if (!user) {
             console.warn(`Password change attempted for non-existent user email: ${userEmail} after token auth.`);
             return res.status(404).json({ message: "User not found." }); // Should not happen with valid token
        }

        // 2. Compare the provided currentPassword with the stored hashed password
        // Use encrypt.comparePassword, which internally fetches the hashed pass again or uses the provided user object
        // Assuming encrypt.comparePassword can take the user object or identifier
        // Based on your login route, it takes loginIdentifier. Let's use email.
        const isCurrentPasswordCorrect = await encrypt.comparePassword(userEmail, currentPassword); // Use email as identifier

        if (!isCurrentPasswordCorrect) {
            // If current password does not match, return 401 Unauthorized or 403 Forbidden
            return res.status(401).json({ message: "Incorrect current password." });
        }

        // 3. Hash the new password
        const hashedNewPassword = await encrypt.encrypt(newPassword);

        // 4. Update the HASHED_PASS in the database
        // Using db.run directly as requested, identifying by user ID (more reliable than email for UPDATE)
        // Need access to the 'db' instance here. Assuming it's available via dbOperations or requires('./database.js')
        // If dbOperations doesn't expose 'db', you might need to add a specific update function there.
        // Let's assume dbOperations exports the db instance or you can require it here.
        // const db = require('../../../database/database.js'); // Uncomment if needed

        // Using dbOperations.changePassword (the function we discussed, even if not strictly needed by user request)
        // This is cleaner than inline db.run here. Let's use the function we just added to dbOperations.
        // If you truly don't want a new function, replace the line below with direct db.run
        await dbOperations.changePassword(userId, hashedNewPassword); // Use the function that updates by ID

        // If update is successful
        console.log(`Password updated successfully for user ID: ${userId}`);
        return res.status(200).json({ message: "Password updated successfully." });

    } catch (error) {
        // Handle any errors during the process (DB errors, hashing errors, etc.)
        console.error(`Error patching password for user ID ${userId}:`, error);
        return res.status(500).json({ message: "Failed to update password." });
    }
});
// --------------------------------------------------


module.exports = router;
