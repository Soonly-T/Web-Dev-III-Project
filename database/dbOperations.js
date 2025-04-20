const db= require("./database.js") 


const addUser = (username, email, hashedPass) => {
    return new Promise((resolve, reject) => {
        
        db.get("SELECT 1 FROM USERS WHERE USERNAME = ? OR EMAIL = ?", [username, email], (err, row) => {
            if (err) {
                console.error("Error checking existing user:", err);
                return reject(err);
            }
            if (row) {
                
                return reject(new Error("Username or email already exists in the database."));
            }
            
            db.run(`INSERT INTO USERS(USERNAME, EMAIL, HASHED_PASS) VALUES (?, ?, ?)`, [username, email, hashedPass], function(err) {
                if (err) {
                    console.error("Error inserting new user:", err);
                    return reject(err);
                }
                
                
                 const newUserId = this.lastID;
                 db.get("SELECT ID, USERNAME, EMAIL FROM USERS WHERE ID = ?", [newUserId], (err, row) => {
                    if (err) {
                        console.error("Error retrieving new user data:", err);
                        return reject(err);
                    }
                    console.log("New user added:", row);
                    resolve(row); 
                });
            });
        });
    });
};



const changePassword = (userId, hashedNewPassword) => {
    return new Promise((resolve, reject) => {
        try {
            
            db.run("UPDATE USERS SET HASHED_PASS = ? WHERE ID = ?", [hashedNewPassword, userId], function(err) {
                if (err) {
                    console.error(`Error changing password for user ID ${userId}:`, err);
                    reject(err); 
                } else if (this.changes === 0) {
                    
                     console.warn(`Password update attempted for non-existent user ID: ${userId}`);
                     
                     reject(new Error("User not found or password not changed."));
                }
                 else {
                    console.log(`Password changed successfully for user ID ${userId}.`);
                    resolve(); 
                }
            });
        } catch (err) {
            console.error(`Caught exception in changePassword for user ID ${userId}:`, err);
            reject(err); 
        }
    });
};



const removeUser = (userId) => {
    return new Promise((resolve, reject) => {
        
        db.serialize(() => { 
            db.run("BEGIN TRANSACTION;"); 
            db.run("DELETE FROM EXPENSE WHERE USER_ID = ?", [userId], function(err) {
                if (err) {
                    console.error(`Error deleting expenses for user ID ${userId}:`, err);
                    db.run("ROLLBACK;"); 
                    return reject(err);
                }
                db.run("DELETE FROM USERS WHERE ID = ?", [userId], function(err) {
                    if (err) {
                        console.error(`Error deleting user ID ${userId}:`, err);
                        db.run("ROLLBACK;"); 
                        return reject(err);
                    }
                    db.run("COMMIT;"); 
                    console.log(`User ID ${userId} and their expenses removed successfully.`);
                    resolve(); 
                });
            });
        });
    });
};


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


const patchEmail = (newEmail, username) => { 
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


const modifyExpense = (id, userId, amount, category, notes) => {
    return new Promise((resolve, reject) => {
        try {
            
            db.run("UPDATE EXPENSE SET AMOUNT = ?, CATEGORY = ?, NOTES = ? WHERE ID = ? AND USER_ID = ?", [amount, category, notes, id, userId], function(err) {
                if (err) {
                    console.error(`Error modifying expense ID ${id} for user ID ${userId}:`, err);
                    reject(err);
                } else if (this.changes === 0) {
                    
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


const getExpenses = (userId) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT ID, USER_ID, AMOUNT, CATEGORY, DATE, NOTES FROM EXPENSE WHERE USER_ID = ?", [userId], (err, rows) => { 
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
        return row ? row.HASHED_PASS : null; 
    } catch (err) {
        console.error("Error in getHashedPass:", err);
        throw err;
    }
};


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
        return row; 
    } catch (err) {
        console.error("Error in getUser:", err);
        throw err;
    }
};


const getExpenseByIdAndUserId = (expenseId, userId) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT ID, USER_ID, AMOUNT, CATEGORY, DATE, NOTES FROM EXPENSE WHERE ID = ? AND USER_ID = ?", [expenseId, userId], (err, row) => { 
            if (err) {
                console.error(`Error fetching expense ID ${expenseId} for user ID ${userId}:`, err);
                reject(err);
            } else {
                console.log(`Fetched expense ID ${expenseId} for user ID ${userId}:`, row);
                resolve(row); 
            }
        });
    });
};





const getUserById = (userId) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT ID, USERNAME, EMAIL FROM USERS WHERE ID = ?", [userId], (err, row) => {
            if (err) {
                console.error(`Error getting user by ID ${userId}:`, err);
                reject(err);
            } else {
                console.log(`getUserById result for ID ${userId}:`, row);
                resolve(row); 
            }
        });
    });
};




module.exports = {
    addUser,
    changePassword, 
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
    getUserById 
};
