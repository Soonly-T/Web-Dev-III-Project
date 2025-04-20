import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // Assuming global styles
import './settings.css'; // Assuming settings.css exists

// Define constants
const MIN_PASSWORD_LENGTH = 8; // Use the same constant as login/signup
// Assuming backendURL will be passed as a prop or from context

/**
 * Component for users to view and modify their profile settings (username, password).
 * Email is displayed statically as it is immutable.
 * Includes a button to navigate back to the dashboard.
 * Requires backend endpoints for:
 * - GET /retrieve-user-data (Authenticated, returns { id, username, email, ... })
 * - PATCH /user/patch-username (Authenticated, expects { newUsername } in body)
 * - PATCH /user/patch-password (Authenticated, expects { currentPassword, newPassword } in body - NEEDS BACKEND IMPLEMENTATION)
 */
function UserSettingsPage({ backendURL }) {
    // State for current user data displayed
    const [currentUsername, setCurrentUsername] = useState('');
    const [currentEmail, setCurrentEmail] = useState(''); // Keep current email state for display

    // State for form inputs (for new values)
    const [newUsername, setNewUsername] = useState('');
    // Removed: const [newEmail, setNewEmail] = useState(''); // Email is now static
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    // State for loading, errors, and success messages
    const [isLoading, setIsLoading] = useState(true); // Loading state for initial fetch and updates
    const [error, setError] = useState(''); // Stores any error message
    const [successMessage, setSuccessMessage] = useState(''); // Stores success message
    const [passwordMatchError, setPasswordMatchError] = useState(''); // Specific error for password mismatch

    const navigate = useNavigate(); // Hook for navigation

    // --- Effect to Fetch Current User Data on Component Mount ---
    // This effect runs once when the component mounts to load the user's current profile data.
    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true); // Start loading indicator
            setError(''); // Clear previous errors

            const token = localStorage.getItem('token'); // Get the JWT token
            // If no token, redirect to login page
            if (!token) {
                console.warn("No token found, redirecting to login.");
                navigate('/login-signup');
                return; // Stop execution
            }

            try {
                // --- FETCHING USER DATA using the new backend endpoint ---
                // Send GET request to the backend endpoint that retrieves the logged-in user's data
                const response = await fetch(`${backendURL}/retrieve-user-data`, {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Include the authentication token
                    },
                });
                // --------------------------------------------------------

                // Handle 401 Unauthorized response (token expired or invalid)
                if (response.status === 401) {
                    console.warn("Token expired or invalid (401 received), redirecting to login.");
                    localStorage.removeItem('token'); // Remove invalid token
                    navigate('/login-signup'); // Redirect to login
                    return; // Stop execution
                }

                // Handle other non-OK HTTP status codes
                if (!response.ok) {
                     let errorMessage = `Failed to fetch user data: ${response.status}`;
                     try {
                          const errorData = await response.json(); // Attempt to read error message from body
                          errorMessage = errorData.message || errorMessage;
                     } catch (jsonError) {
                         console.error("Failed to parse error response on non-OK status:", jsonError);
                         // Use default message if JSON parsing fails
                     }
                     throw new Error(errorMessage); // Throw error to be caught below
                }

                // If response is OK (e.g., 200), parse the JSON data
                const userData = await response.json();
                console.log("Fetched user data:", userData); // Log fetched data

                // Update state with the fetched user data
                // Assuming the backend response body contains 'username' and 'email' properties
                setCurrentUsername(userData.username || '');
                setCurrentEmail(userData.email || ''); // Set the current email for display

            } catch (err) {
                 // Catch any errors during fetch or processing (including JSON parsing errors)
                 console.error("Error fetching user data:", err);
                 setError(`Failed to load user data: ${err.message}`); // Display error message
            } finally {
                setIsLoading(false); // Stop loading indicator regardless of success or failure
            }
        };

        fetchUserData(); // Call the fetch function when the component mounts or dependencies change
    }, [backendURL, navigate]); // Dependencies: backendURL prop and navigate hook

    // --- Handlers for Updates ---

    /**
     * Handles submitting changes to Username.
     * Sends PATCH request to the backend.
     * Email update logic removed.
     */
    const handleUpdateProfile = async (e) => {
        e.preventDefault(); // Prevent default form refresh
        setError(''); // Clear previous error
        setSuccessMessage(''); // Clear previous success message
        setPasswordMatchError(''); // Clear password mismatch error

        // Check if the username field has actually changed and is not just whitespace
        const usernameChanged = newUsername.trim() !== '' && newUsername.trim() !== currentUsername;

        // If no changes were made, show a message and stop
        // Updated condition to only check username
        if (!usernameChanged) {
            setError('No changes detected.');
            return;
        }

        const token = localStorage.getItem('token'); // Get the JWT token
        // If no token, redirect to login page
        if (!token) {
            navigate('/login-signup');
            return;
        }

        setIsLoading(true); // Start loading indicator for the update process

        try {
            // --- Update Username if changed ---
            // The email update logic (if (emailChanged) { ... }) is removed
            if (usernameChanged) {
                 console.log("Updating username to:", newUsername.trim());
                 // Send PATCH request for username update
                 const usernameResponse = await fetch(`${backendURL}/user/patch-username`, {
                     method: 'PATCH',
                     headers: {
                         'Content-Type': 'application/json', // Indicate JSON body
                         'Authorization': `Bearer ${token}`, // Include authentication token
                     },
                     body: JSON.stringify({ newUsername: newUsername.trim() }), // Send the new username in the body
                 });

                 // Handle 401 (Expired/Invalid Token) during update
                 if (usernameResponse.status === 401) { localStorage.removeItem('token'); navigate('/login-signup'); return; }

                 // Handle non-OK response for username update
                 if (!usernameResponse.ok) {
                     let errorMessage = `Failed to update username: ${usernameResponse.status}`;
                      try {
                         const errorData = await usernameResponse.json();
                         errorMessage = errorData.message || errorMessage;
                     } catch (jsonError) {
                         console.error("Failed to parse username update error response:", jsonError);
                     }
                     throw new Error(errorMessage); // Throw error to be caught below
                 }

                 // On successful username update
                 console.log("Username updated successfully via backend.");
                 setCurrentUsername(newUsername.trim()); // Update the displayed current username
                 setNewUsername(''); // Clear the input field
                 setSuccessMessage('Username updated successfully!'); // Set success message
            }

            // Since email update logic is removed, the success message is simpler
            // If usernameChanged was true, successMessage is already set.
            // If usernameChanged was false, the function would have returned earlier.


        } catch (err) {
            // Catch any errors during fetch or processing of updates
            console.error("Error updating profile:", err);
            setError(`Update failed: ${err.message}`); // Display error message
             setSuccessMessage(''); // Clear success message on error
        } finally {
            setIsLoading(false); // Stop loading indicator
        }
    };

    /**
     * Handles submitting a password change request.
     * Sends PATCH request to the backend endpoint.
     * REQUIRES BACKEND ENDPOINT IMPLEMENTATION (e.g., PATCH /user/patch-password).
     */
    const handleUpdatePassword = async (e) => {
        e.preventDefault(); // Prevent default form refresh
        setError(''); // Clear previous error
        setSuccessMessage(''); // Clear previous success message
        setPasswordMatchError(''); // Clear password mismatch error

        // --- Validation ---
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setError('All password fields are required.');
            return; // Stop if fields are empty
        }
        if (newPassword !== confirmNewPassword) {
            setPasswordMatchError("New passwords do not match."); // Set specific mismatch error
            return; // Stop if passwords don't match
        }
        if (newPassword.length < MIN_PASSWORD_LENGTH) {
             setError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
             return; // Stop if new password is too short
        }
         if (newPassword === currentPassword) {
             setError('New password must be different from the current password.');
             return; // Stop if new password is the same as current
         }
        // ------------------

        const token = localStorage.getItem('token'); // Get the JWT token
        // If no token, redirect to login page
        if (!token) {
            navigate('/login-signup');
            return;
        }

         setIsLoading(true); // Start loading indicator

        try {
            // --- PASSWORD UPDATE - REQUIRES BACKEND ENDPOINT ---
            // ASSUMING BACKEND HAS PATCH /user/patch-password endpoint
            // This endpoint needs to authenticate, verify currentPassword, hash newPassword, and update in DB
            const response = await fetch(`${backendURL}/user/patch-password`, { // <-- Endpoint URL
                method: 'PATCH', // Use PATCH for partial update
                headers: {
                    'Content-Type': 'application/json', // Indicate JSON body
                    'Authorization': `Bearer ${token}`, // Include authentication token
                },
                body: JSON.stringify({ // Send current and new password in the body
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                    // confirmNewPassword: confirmNewPassword // Usually not needed on backend if frontend checks
                }),
            });
            // ---------------------------------------------------

            // Handle 401 (Expired/Invalid Token) during update
            if (response.status === 401) { localStorage.removeItem('token'); navigate('/login-signup'); return; }

            // Handle specific backend errors for password change (e.g., current password incorrect)
            // Adjust status codes based on your backend implementation (e.g., 400 for bad request, 403 for incorrect current password)
             if (response.status === 400 || response.status === 403) {
                 let errorMessage = 'Password update failed';
                 try {
                     const errorData = await response.json();
                     errorMessage = errorData.message || errorMessage;
                 } catch (jsonError) {
                      console.error("Failed to parse password update specific error response:", jsonError);
                 }
                 throw new Error(errorMessage); // Throw specific error message
             }

            // Handle other non-OK response statuses
            if (!response.ok) {
                 let errorMessage = `Failed to update password: ${response.status}`;
                  try {
                     const errorData = await response.json();
                     errorMessage = errorData.message || errorMessage;
                 } catch (jsonError) {
                     console.error("Failed to parse password update general error response:", jsonError);
                 }
                throw new Error(errorMessage); // Throw general error message
            }

            // Success: Password updated successfully
            console.log("Password updated successfully via backend.");
            setSuccessMessage('Password updated successfully!'); // Set success message
            // Clear password fields after successful update
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');

        } catch (err) {
            // Catch any errors during fetch or processing
            console.error("Error updating password:", err);
            setError(`Password update failed: ${err.message}`); // Display error message
             setSuccessMessage(''); // Clear success message on error
        } finally {
            setIsLoading(false); // Stop loading indicator
        }
    };


    // --- Render ---
    // Show loading indicator if data is being fetched initially and no data is available
    if (isLoading && (!currentUsername && !currentEmail)) { // Adjusted initial loading check
        return <div className="loading-indicator">Loading user data...</div>;
    }

    // Display a prominent error message if initial data load failed and no data is available
    if (error && (!currentUsername && !currentEmail) && !isLoading) { // Adjusted initial error check
         return <div className="error-message">Error loading user data: {error}</div>;
    }


    return (
        <div className="settings-container"> {/* Use a dedicated class for this container */}

            {/* --- Back Button --- */}
            <button onClick={() => navigate('/home')} className="back-button">
                Back to Dashboard
            </button>
            {/* ------------------- */}

            <h2>User Settings</h2>

            {/* Display general errors or success messages above the forms */}
            {successMessage && <div className="alert success">{successMessage}</div>}
            {error && <div className="alert failure">{error}</div>}
             {/* Show loading indicator while any save operation is in progress */}
             {isLoading && (currentUsername || currentEmail) && <div className="loading-indicator">Saving changes...</div>}


            {/* --- Profile Update Form (Username & Email) --- */}
            <div className="settings-section">
                <h3>Update Profile Information</h3>
                {/* Display current username and email */}
                <p>Current Username: <strong>{currentUsername}</strong></p>
                {/* Display email statically */}
                <p>Email: <strong>{currentEmail}</strong></p>

                <form onSubmit={handleUpdateProfile}>
                     {/* Input group for New Username */}
                     <div className='input-group'>
                        <label htmlFor="newUsername">New Username:</label>
                        <input
                            type="text"
                            id="newUsername"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="Enter new username"
                        />
                    </div>

                    {/* Removed: Input group for New Email */}
                    {/*
                     <div className='input-group'>
                        <label htmlFor="newEmail">New Email:</label>
                        <input
                            type="email"
                            id="newEmail"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Enter new email"
                        />
                    </div>
                    */}

                    {/* Submit button for Profile Update */}
                    <button
                        type="submit"
                        // Disable button while loading or if new username field is empty
                        // Updated disabled condition to only check newUsername
                        disabled={isLoading || newUsername.trim() === ''}
                    >
                        Update Username
                    </button>
                </form>
            </div> {/* End .settings-section */}

            {/* --- Password Update Form --- */}
             <div className="settings-section">
                <h3>Update Password</h3>
                <form onSubmit={handleUpdatePassword}>
                    {/* Input group for Current Password */}
                    <div className='input-group'>
                        <label htmlFor="currentPassword">Current Password:</label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required // Make current password required
                        />
                    </div>

                    {/* Input group for New Password */}
                    <div className='input-group'>
                        <label htmlFor="newPassword">New Password:</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required // Make new password required
                             minLength={MIN_PASSWORD_LENGTH} // Client-side hint for min length
                        />
                    </div>

                    {/* Input group for Confirm New Password */}
                    <div className='input-group'>
                        <label htmlFor="confirmNewPassword">Confirm New Password:</label>
                        <input
                            type="password"
                            id="confirmNewPassword"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required // Make confirm password required
                             minLength={MIN_PASSWORD_LENGTH} // Client-side hint for min length
                        />
                    </div>

                    {/* Display password mismatch error if state is set */}
                    {passwordMatchError && <div className="error">{passwordMatchError}</div>}


                    {/* Submit button for Password Update */}
                    <button
                        type="submit"
                        // Disable button while loading or if any password field is empty
                        disabled={isLoading || !currentPassword || !newPassword || !confirmNewPassword}
                    >
                        Update Password
                    </button>
                </form>
            </div> {/* End .settings-section */}

        </div> // End .settings-container
    );
}

export default UserSettingsPage;
