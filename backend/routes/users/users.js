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

module.exports = router;