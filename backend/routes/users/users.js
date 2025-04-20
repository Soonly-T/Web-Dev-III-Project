const express = require('express');
const dbOperations = require('../../../database/dbOperations');
const router=express.Router();
const encrypt=require('../../encrypt')
const jwt=require('../../middleware/jwt')

router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPass = await encrypt.encrypt(password);
        const newUser = await dbOperations.addUser(username, email, hashedPass);
        return res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        console.error("Error during signup:", error);
        let statusCode = 500;
        let message = "Error during signup";

        if (error.message === "Username or email already exists in the database.") {
            statusCode = 409;
            message = error.message;
        } else if (error.code === 'SQLITE_CONSTRAINT') {
            statusCode = 409;
            message = "Username or email already exists";
        }

        return res.status(statusCode).json({ message: message });
    }
});

router.post("/login", async (req, res) => {
    const { loginIdentifier, password } = req.body;
    try {
        const getuser=await dbOperations.getUser(loginIdentifier);
        if (!getuser) {
            throw new Error("User not found");
        }
        const correct = await encrypt.comparePassword(loginIdentifier, password);
        console.log("correct: ", correct)
        if (correct) {
            const userData = await dbOperations.getUser(loginIdentifier);
            console.log(userData)
            const userjwt = jwt.generateAccessToken(userData);
            // Write the logic for the jwt token
            return res.status(200).json({ token: userjwt, message: "Login successful",userData:userData });
        } else {
            // Alert user invalid credential
            return res.status(401).json({ message: "Password does not match with the username or email" });
        }
    } catch (err) {
        console.log("Error:"+err);
        // Display to the user code that user not found
        if (err.message === "User not found") {
            // Handle the "user not found" error
            return res.status(401).json({ message: "Username or Email is incorrect" });
        } else {
            // Handle other errors (e.g., database errors)
            return res.status(500).json({ message: "Something went wrong"+err });
        }
    }
});

router.get('/get-user', async (req, res) => {
    const { loginIdentifier,password } = req.body;
    try {
        const user = await dbOperations.getUser(loginIdentifier);
        if (user) {
            return res.status(200).json(user);
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Failed to fetch user" });
    }
});

router.get('/retrieve-user-data', jwt.authenticateToken, async (req, res) => {
    // authenticateToken middleware successfully verified the token
    // and attached the decoded user payload to req.user
    // The token payload includes id, username, and email (from generateAccessToken)

    // Get the user's email from the token payload
    // Assuming the email is stored in req.user.email (lowercase key from payload)
    const userEmail = req.user.email;

    console.log(`Attempting to retrieve data for user with email: ${userEmail}`); // Log for debugging

    try {
        // Fetch the user details from the database using the email
        // Reusing the existing dbOperations.getUser function which can search by email
        const user = await dbOperations.getUser(userEmail);

        // Check if the user was found in the database using the email
        // This check is mainly for safety; if authenticateToken passed, the user should exist.
        if (!user) {
            console.warn(`User data not found in DB for email: ${userEmail} after token auth.`);
            // Although authenticated, user data not found in DB might indicate a data issue
            // This could happen if the user was deleted after the token was issued.
            // Returning 404 or 401 (if you want to force re-auth) is appropriate.
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

router.patch('/user/patch-username', jwt.authenticateToken, async (req, res) => {
    const { newUsername } = req.body;
    const oldUsername = req.user.USERNAME; // Assuming the JWT middleware adds user info to req.user
    if (!newUsername) {
        return res.status(400).json({ message: "New username is required." });
    }
    try {
        await dbOperations.patchUsername(oldUsername, newUsername);
        return res.status(200).json({ message: "Username updated successfully." });
    } catch (error) {
        console.error("Error updating username:", error);
        return res.status(500).json({ message: "Failed to update username." });
    }
});

router.patch('/user/patch-email', jwt.authenticateToken, async (req, res) => {
    const { newEmail } = req.body;
    const username = req.user.USERNAME; // Assuming the JWT middleware adds user info to req.user
    if (!newEmail) {
        return res.status(400).json({ message: "New email is required." });
    }
    try {
        await dbOperations.patchEmail(newEmail, username);
        return res.status(200).json({ message: "Email updated successfully." });
    } catch (error) {
        console.error("Error updating email:", error);
        return res.status(500).json({ message: "Failed to update email." });
    }
});

module.exports = router;