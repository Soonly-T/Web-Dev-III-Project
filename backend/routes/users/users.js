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
        console.log("Password comparison correct: ", correct);
        
        if (correct) {
            
             const userData = await dbOperations.getUser(loginIdentifier); 
            console.log("User data for token:", userData);
            
            const userjwt = jwt.generateAccessToken(userData);
            
            return res.status(200).json({ token: userjwt, message: "Login successful",userData:userData });
        } else {
            
            return res.status(401).json({ message: "Password does not match with the username or email" });
        }
    } catch (err) {
        console.error("Error during login:", err);
        
        if (err.message === "User not found") {
            return res.status(401).json({ message: "Username or Email is incorrect" });
        } else {
            
            return res.status(500).json({ message: "Something went wrong: "+err.message }); 
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
        console.error("Error in /get-user:", err);
        return res.status(500).json({ message: "Failed to fetch user" });
    }
});


router.get('/retrieve-user-data', jwt.authenticateToken, async (req, res) => {
    
    

    
    
    const userEmail = req.user.email;

    console.log(`Attempting to retrieve data for user with email: ${userEmail}`); 

    try {
        
        
        const user = await dbOperations.getUser(userEmail);

        
        if (!user) {
            console.warn(`User data not found in DB for email: ${userEmail} after token auth.`);
            
            return res.status(404).json({ message: "User data not found" });
        }

        console.log(`Successfully retrieved data for user with email: ${userEmail}`); 

        
        
        return res.status(200).json({
            id: user.ID, 
            username: user.USERNAME, 
            email: user.EMAIL, 
            
        });

    } catch (err) {
        
        console.error(`Error retrieving user data for email ${userEmail}:`, err);
        return res.status(500).json({ message: "Failed to retrieve user data" });
    }
});


router.patch('/user/patch-username', jwt.authenticateToken, async (req, res) => {
    const { newUsername } = req.body;
    
    const oldUsername = req.user.username; 

    
    if (!newUsername || newUsername.trim() === '') {
        return res.status(400).json({ message: "New username is required." });
    }
     if (newUsername.trim() === oldUsername) {
         return res.status(400).json({ message: "New username must be different from the current username." });
     }

    try {
        
        
        await dbOperations.patchUsername(oldUsername, newUsername.trim());
        
        return res.status(200).json({ message: "Username updated successfully." });
    } catch (error) {
        console.error("Error updating username:", error);
         
         if (error.message && error.message.includes("already exists")) { 
              return res.status(409).json({ message: error.message });
         }
        return res.status(500).json({ message: "Failed to update username." });
    }
});



router.patch('/user/patch-email', jwt.authenticateToken, async (req, res) => {
    const { newEmail } = req.body;
    
    const username = req.user.username; 

     
    if (!newEmail || newEmail.trim() === '') {
        return res.status(400).json({ message: "New email is required." });
    }
     if (newEmail.trim() === req.user.email) { 
          return res.status(400).json({ message: "New email must be different from the current email." });
     }

    try {
        
        
        await dbOperations.patchEmail(newEmail.trim(), username);
        
        return res.status(200).json({ message: "Email updated successfully." });
    } catch (error) {
        console.error("Error updating email:", error);
         
         if (error.message && error.message.includes("already exists")) { 
              return res.status(409).json({ message: error.message });
         }
        return res.status(500).json({ message: "Failed to update email." });
    }
});


router.patch('/user/patch-password', jwt.authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    
    const userEmail = req.user.email; 
    const userId = req.user.id; 

    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required." });
    }
    
    

    try {
        
        const user = await dbOperations.getUser(userEmail); 

        
        if (!user) {
             console.warn(`Password change attempted for non-existent user email: ${userEmail} after token auth.`);
             return res.status(404).json({ message: "User not found." }); 
        }

        
        
        
        
        const isCurrentPasswordCorrect = await encrypt.comparePassword(userEmail, currentPassword); 

        if (!isCurrentPasswordCorrect) {
            
            return res.status(401).json({ message: "Incorrect current password." });
        }

        
        const hashedNewPassword = await encrypt.encrypt(newPassword);

        
        
        
        
        
        

        
        
        
        await dbOperations.changePassword(userId, hashedNewPassword); 

        
        console.log(`Password updated successfully for user ID: ${userId}`);
        return res.status(200).json({ message: "Password updated successfully." });

    } catch (error) {
        
        console.error(`Error patching password for user ID ${userId}:`, error);
        return res.status(500).json({ message: "Failed to update password." });
    }
});



module.exports = router;
