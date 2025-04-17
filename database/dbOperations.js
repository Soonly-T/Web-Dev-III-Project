const db= require("./database.js")

const addUser = (username, email, hashedPass) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT 1 FROM USERS WHERE USERNAME = ? OR EMAIL = ?", [username, email], (err, row) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            if (row) {
                return reject(new Error("Username or email already exists in the database."));
            }
            db.run(`INSERT INTO USERS(USERNAME, EMAIL, HASHED_PASS) VALUES (?, ?, ?)`, [username, email, hashedPass], function(err) {
                if (err) {
                    console.log(err);
                    return reject(err);
                }
                db.get("SELECT ID, USERNAME, EMAIL FROM USERS WHERE USERNAME = ?", [username], (err, row) => {
                    if (err) {
                        console.log(err);
                        return reject(err);
                    }
                    console.log(row);
                    resolve(row);
                });
            });
        });
    });
};

const removeUser = (userId) => {
    return new Promise((resolve, reject) => {
        try {
            db.run("DELETE FROM EXPENSE WHERE USER_ID = ?", [userId], function(err) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    db.run("DELETE FROM USERS WHERE ID = ?", [userId], function(err) {
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                }
            });
        } catch (err) {
            reject(err);
        }
    });
};

const patchUsername = (oldUsername, newUsername) => {
    return new Promise((resolve, reject) => {
        try {
            db.run("UPDATE USERS SET USERNAME = ? WHERE USERNAME = ?", [newUsername, oldUsername], function(err) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        } catch (err) {
            reject(err);
        }
    });
};

const patchEmail = (newEmail, username) => {
    return new Promise((resolve, reject) => {
        try {
            db.run("UPDATE USERS SET EMAIL = ? WHERE USERNAME = ?", [newEmail, username], function(err) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        } catch (err) {
            reject(err);
        }
    });
};

const addExpense = (userId, amount, category, date, notes) => {
    return new Promise((resolve, reject) => {
        try {
            db.run("INSERT INTO EXPENSE (USER_ID, AMOUNT, CATEGORY, DATE, NOTES) VALUES (?, ?, ?, ?, ?)", [userId, amount, category, date, notes], function(err) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        } catch (err) {
            reject(err);
        }
    });
};


const modifyExpense = (id, userId, amount, category, notes) => {
    return new Promise((resolve, reject) => {
        try {

            db.run("UPDATE EXPENSE SET AMOUNT = ?, CATEGORY = ?, NOTES = ? WHERE ID = ? AND USER_ID = ?", [amount, category, notes, id, userId], function(err) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        } catch (err) {
            reject(err);
        }
    });
};

const removeExpense = (id) => {
    return new Promise((resolve, reject) => {
        try {
            db.run("DELETE FROM EXPENSE WHERE ID = ?", [id], function(err) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        } catch (err) {
            reject(err);
        }
    });
};

const getExpenses = (userId) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM EXPENSE WHERE USER_ID = ?", [userId], (err, rows) => {
            if (err) {
                console.error("Error fetching expenses:", err);
                reject(err);
            } else {
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
        return row ? row.HASHED_PASS : null; // Return the hashed password or null if not found
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
        return row;
    } catch (err) {
        console.error("Error in getUser:", err);
        throw err;
    }
};

const getExpenseByIdAndUserId = (expenseId, userId) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM EXPENSE WHERE ID = ? AND USER_ID = ?", [expenseId, userId], (err, row) => {
            if (err) {
                console.error("Error fetching expense:", err);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};


module.exports = {
    addUser,
    removeUser,
    patchUsername,
    patchEmail,
    addExpense,
    modifyExpense,
    removeExpense,
    getExpenses,
    getHashedPass,
    getUser,
    getExpenseByIdAndUserId
};