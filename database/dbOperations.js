const db= require("./database.js") // Assuming database.js exports your SQLite database instance

// Function to add a new user to the database
const addUser = (username, email, hashedPass) => {
    return new Promise((resolve, reject) => {
        // Check if username or email already exists
        db.get("SELECT 1 FROM USERS WHERE USERNAME = ? OR EMAIL = ?", [username, email], (err, row) => {
            if (err) {
                console.error("Error checking existing user:", err);
                return reject(err);
            }
            if (row) {
                // Reject if user with same username or email already exists
                return reject(new Error("Username or email already exists in the database."));
            }
            // Insert the new user into the USERS table
            db.run(`INSERT INTO USERS(USERNAME, EMAIL, HASHED_PASS) VALUES (?, ?, ?)`, [username, email, hashedPass], function(err) {
                if (err) {
                    console.error("Error inserting new user:", err);
                    return reject(err);
                }
                // Retrieve the newly inserted user's ID, USERNAME, and EMAIL
                // Use this.lastID for the ID of the newly inserted row
                 const newUserId = this.lastID;
                 db.get("SELECT ID, USERNAME, EMAIL FROM USERS WHERE ID = ?", [newUserId], (err, row) => {
                    if (err) {
                        console.error("Error retrieving new user data:", err);
                        return reject(err);
                    }
                    console.log("New user added:", row);
                    resolve(row); // Resolve with the new user's data
                });
            });
        });
    });
};

// --- New Function to Change User Password ---
// Takes the user's ID and the new hashed password
const changePassword = (userId, hashedNewPassword) => {
    return new Promise((resolve, reject) => {
        try {
            // Update the HASHED_PASS column for the specified user ID
            db.run("UPDATE USERS SET HASHED_PASS = ? WHERE ID = ?", [hashedNewPassword, userId], function(err) {
                if (err) {
                    console.error(`Error changing password for user ID ${userId}:`, err);
                    reject(err); // Reject promise on error
                } else if (this.changes === 0) {
                    // Check if any rows were actually updated (user ID exists)
                     console.warn(`Password update attempted for non-existent user ID: ${userId}`);
                     // Reject if no user was found with that ID
                     reject(new Error("User not found or password not changed."));
                }
                 else {
                    console.log(`Password changed successfully for user ID ${userId}.`);
                    resolve(); // Resolve promise on success
                }
            });
        } catch (err) {
            console.error(`Caught exception in changePassword for user ID ${userId}:`, err);
            reject(err); // Reject promise on caught exception
        }
    });
};
// ------------------------------------------

// Function to remove a user and their associated expenses
const removeUser = (userId) => {
    return new Promise((resolve, reject) => {
        // Use database transaction for atomicity (optional but recommended for related deletes)
        db.serialize(() => { // Use serialize to ensure commands run in order
            db.run("BEGIN TRANSACTION;"); // Start transaction
            db.run("DELETE FROM EXPENSE WHERE USER_ID = ?", [userId], function(err) {
                if (err) {
                    console.error(`Error deleting expenses for user ID ${userId}:`, err);
                    db.run("ROLLBACK;"); // Rollback if expense deletion fails
                    return reject(err);
                }
                db.run("DELETE FROM USERS WHERE ID = ?", [userId], function(err) {
                    if (err) {
                        console.error(`Error deleting user ID ${userId}:`, err);
                        db.run("ROLLBACK;"); // Rollback if user deletion fails
                        return reject(err);
                    }
                    db.run("COMMIT;"); // Commit transaction on success
                    console.log(`User ID ${userId} and their expenses removed successfully.`);
                    resolve(); // Resolve after both deletions
                });
            });
        });
    });
};

// Function to update a user's username
const patchUsername = (oldUsername, newUsername) => {
    return new Promise((resolve, reject) => {
        try {
            db.run("UPDATE USERS SET USERNAME = ? WHERE USERNAME = ?", [newUsername, oldUsername], function(err) {
                if (err) {
                    console.error(`Error patching username from ${oldUsername} to ${newUsername}:`, err);
                    reject(err);
                } else if (this.changes === 0) {
                     console.warn(`Username update attempted for non-existent username: ${oldUsername}`);
                     reject(new Error("User not found or username not changed."));
                }
                else {
                    console.log(`Username patched successfully from ${oldUsername} to ${newUsername}.`);
                    resolve();
                }
            });
        } catch (err) {
            console.error(`Caught exception in patchUsername:`, err);
            reject(err);
        }
    });
};

// Function to update a user's email
const patchEmail = (newEmail, username) => { // Note: This uses username to identify the user
    return new Promise((resolve, reject) => {
        try {
            db.run("UPDATE USERS SET EMAIL = ? WHERE USERNAME = ?", [newEmail, username], function(err) {
                if (err) {
                    console.error(`Error patching email for username ${username} to ${newEmail}:`, err);
                    reject(err);
                } else if (this.changes === 0) {
                     console.warn(`Email update attempted for non-existent username: ${username}`);
                     reject(new Error("User not found or email not changed."));
                }
                else {
                    console.log(`Email patched successfully for username ${username} to ${newEmail}.`);
                    resolve();
                }
            });
        } catch (err) {
            console.error(`Caught exception in patchEmail:`, err);
            reject(err);
        }
    });
};

// Function to add a new expense
const addExpense = (userId, amount, category, date, notes) => {
    return new Promise((resolve, reject) => {
        try {
            db.run("INSERT INTO EXPENSE (USER_ID, AMOUNT, CATEGORY, DATE, NOTES) VALUES (?, ?, ?, ?, ?)", [userId, amount, category, date, notes], function(err) {
                if (err) {
                    console.error(`Error adding expense for user ID ${userId}:`, err);
                    reject(err);
                } else {
                    console.log(`Expense added successfully for user ID ${userId}.`);
                    resolve();
                }
            });
        } catch (err) {
            console.error(`Caught exception in addExpense:`, err);
            reject(err);
        }
    });
};

// Function to modify an existing expense
const modifyExpense = (id, userId, amount, category, notes) => {
    return new Promise((resolve, reject) => {
        try {
            // Update expense details, ensuring it belongs to the correct user
            db.run("UPDATE EXPENSE SET AMOUNT = ?, CATEGORY = ?, NOTES = ? WHERE ID = ? AND USER_ID = ?", [amount, category, notes, id, userId], function(err) {
                if (err) {
                    console.error(`Error modifying expense ID ${id} for user ID ${userId}:`, err);
                    reject(err);
                } else if (this.changes === 0) {
                    // Check if any rows were updated (expense exists and belongs to user)
                     console.warn(`Modify attempted for non-existent or unauthorized expense ID ${id} for user ID ${userId}.`);
                     reject(new Error("Expense not found or unauthorized."));
                }
                else {
                    console.log(`Expense ID ${id} modified successfully for user ID ${userId}.`);
                    resolve();
                }
            });
        } catch (err) {
            console.error(`Caught exception in modifyExpense:`, err);
            reject(err);
        }
    });
};

// Function to remove an expense by ID
const removeExpense = (id) => {
    return new Promise((resolve, reject) => {
        try {
            db.run("DELETE FROM EXPENSE WHERE ID = ?", [id], function(err) {
                if (err) {
                    console.error(`Error removing expense ID ${id}:`, err);
                    reject(err);
                } else if (this.changes === 0) {
                     console.warn(`Remove attempted for non-existent expense ID: ${id}.`);
                     reject(new Error("Expense not found."));
                }
                else {
                    console.log(`Expense ID ${id} removed successfully.`);
                    resolve();
                }
            });
        } catch (err) {
            console.error(`Caught exception in removeExpense:`, err);
            reject(err);
        }
    });
};

// Function to get all expenses for a specific user
const getExpenses = (userId) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT ID, USER_ID, AMOUNT, CATEGORY, DATE, NOTES FROM EXPENSE WHERE USER_ID = ?", [userId], (err, rows) => { // Select specific columns
            if (err) {
                console.error(`Error fetching expenses for user ID ${userId}:`, err);
                reject(err);
            } else {
                console.log(`Fetched ${rows ? rows.length : 0} expenses for user ID ${userId}.`);
                resolve(rows);
            }
        });
    });
};

// Function to get a user's hashed password by username or email
const getHashedPass = async (loginIdentifier) => {
    try {
        const row = await new Promise((resolve, reject) => {
            db.get("SELECT HASHED_PASS FROM USERS WHERE USERNAME = ? OR EMAIL = ?", [loginIdentifier, loginIdentifier], (err, row) => {
                if (err) {
                    console.error("Error getting hashed password:", err);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
        return row ? row.HASHED_PASS : null; // Return the hashed password or null if not found
    } catch (err) {
        console.error("Error in getHashedPass:", err);
        throw err;
    }
};

// Function to get user ID, username, and email by username or email
const getUser = async (loginIdentifier) => {
    try {
        const row = await new Promise((resolve, reject) => {
            db.get("SELECT ID, USERNAME, EMAIL FROM USERS WHERE USERNAME = ? OR EMAIL = ?", [loginIdentifier,loginIdentifier], (err, row) => {
                if (err) {
                    console.error("Error getting user:", err);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
        console.log("getUser result:", row);
        return row; // Returns { ID, USERNAME, EMAIL } or undefined/null
    } catch (err) {
        console.error("Error in getUser:", err);
        throw err;
    }
};

// Function to get a single expense by its ID and associated User ID
const getExpenseByIdAndUserId = (expenseId, userId) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT ID, USER_ID, AMOUNT, CATEGORY, DATE, NOTES FROM EXPENSE WHERE ID = ? AND USER_ID = ?", [expenseId, userId], (err, row) => { // Select specific columns
            if (err) {
                console.error(`Error fetching expense ID ${expenseId} for user ID ${userId}:`, err);
                reject(err);
            } else {
                console.log(`Fetched expense ID ${expenseId} for user ID ${userId}:`, row);
                resolve(row); // Returns { ID, USER_ID, AMOUNT, CATEGORY, DATE, NOTES } or undefined/null
            }
        });
    });
};

// --- Add getUserById function (needed by retrieve-user-data route if not using email) ---
// Based on previous discussion, the retrieve-user-data route was changed to use getUser by email.
// However, if you revert to using ID, this function would be needed.
// Keeping it here as it's a standard operation.
const getUserById = (userId) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT ID, USERNAME, EMAIL FROM USERS WHERE ID = ?", [userId], (err, row) => {
            if (err) {
                console.error(`Error getting user by ID ${userId}:`, err);
                reject(err);
            } else {
                console.log(`getUserById result for ID ${userId}:`, row);
                resolve(row); // Returns { ID, USERNAME, EMAIL } or undefined/null
            }
        });
    });
};
// ---------------------------------------------------------------------------------------


// Export all the database operation functions
module.exports = {
    addUser,
    changePassword, // Export the new function
    removeUser,
    patchUsername,
    patchEmail,
    addExpense,
    modifyExpense,
    removeExpense,
    getExpenses,
    getHashedPass,
    getUser,
    getExpenseByIdAndUserId,
    getUserById // Export getUserById as well
};
