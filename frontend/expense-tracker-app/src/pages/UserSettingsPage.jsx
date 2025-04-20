import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 
import './settings.css'; 


const MIN_PASSWORD_LENGTH = 8; 



function UserSettingsPage({ backendURL }) {
    
    const [currentUsername, setCurrentUsername] = useState('');
    const [currentEmail, setCurrentEmail] = useState(''); 

    
    const [newUsername, setNewUsername] = useState('');
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState(''); 
    const [successMessage, setSuccessMessage] = useState(''); 
    const [passwordMatchError, setPasswordMatchError] = useState(''); 

    const navigate = useNavigate(); 

    
    
    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true); 
            setError(''); 

            const token = localStorage.getItem('token'); 
            
            if (!token) {
                console.warn("No token found, redirecting to login.");
                navigate('/login-signup');
                return; 
            }

            try {
                
                
                const response = await fetch(`${backendURL}/retrieve-user-data`, {
                    headers: {
                        'Authorization': `Bearer ${token}`, 
                    },
                });
                

                
                if (response.status === 401) {
                    console.warn("Token expired or invalid (401 received), redirecting to login.");
                    localStorage.removeItem('token'); 
                    navigate('/login-signup'); 
                    return; 
                }

                
                if (!response.ok) {
                     let errorMessage = `Failed to fetch user data: ${response.status}`;
                     try {
                          const errorData = await response.json(); 
                          errorMessage = errorData.message || errorMessage;
                     } catch (jsonError) {
                         console.error("Failed to parse error response on non-OK status:", jsonError);
                         
                     }
                     throw new Error(errorMessage); 
                }

                
                const userData = await response.json();
                console.log("Fetched user data:", userData); 

                
                
                setCurrentUsername(userData.username || '');
                setCurrentEmail(userData.email || ''); 

            } catch (err) {
                 
                 console.error("Error fetching user data:", err);
                 setError(`Failed to load user data: ${err.message}`); 
            } finally {
                setIsLoading(false); 
            }
        };

        fetchUserData(); 
    }, [backendURL, navigate]); 

    

    
    const handleUpdateProfile = async (e) => {
        e.preventDefault(); 
        setError(''); 
        setSuccessMessage(''); 
        setPasswordMatchError(''); 

        
        const usernameChanged = newUsername.trim() !== '' && newUsername.trim() !== currentUsername;

        
        
        if (!usernameChanged) {
            setError('No changes detected.');
            return;
        }

        const token = localStorage.getItem('token'); 
        
        if (!token) {
            navigate('/login-signup');
            return;
        }

        setIsLoading(true); 

        try {
            
            
            if (usernameChanged) {
                 console.log("Updating username to:", newUsername.trim());
                 
                 const usernameResponse = await fetch(`${backendURL}/user/patch-username`, {
                     method: 'PATCH',
                     headers: {
                         'Content-Type': 'application/json', 
                         'Authorization': `Bearer ${token}`, 
                     },
                     body: JSON.stringify({ newUsername: newUsername.trim() }), 
                 });

                 
                 if (usernameResponse.status === 401) { localStorage.removeItem('token'); navigate('/login-signup'); return; }

                 
                 if (!usernameResponse.ok) {
                     let errorMessage = `Failed to update username: ${usernameResponse.status}`;
                      try {
                         const errorData = await usernameResponse.json();
                         errorMessage = errorData.message || errorMessage;
                     } catch (jsonError) {
                         console.error("Failed to parse username update error response:", jsonError);
                     }
                     throw new Error(errorMessage); 
                 }

                 
                 console.log("Username updated successfully via backend.");
                 setCurrentUsername(newUsername.trim()); 
                 setNewUsername(''); 
                 setSuccessMessage('Username updated successfully!'); 
            }

            
            
            


        } catch (err) {
            
            console.error("Error updating profile:", err);
            setError(`Update failed: ${err.message}`); 
             setSuccessMessage(''); 
        } finally {
            setIsLoading(false); 
        }
    };

    
    const handleUpdatePassword = async (e) => {
        e.preventDefault(); 
        setError(''); 
        setSuccessMessage(''); 
        setPasswordMatchError(''); 

        
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setError('All password fields are required.');
            return; 
        }
        if (newPassword !== confirmNewPassword) {
            setPasswordMatchError("New passwords do not match."); 
            return; 
        }
        if (newPassword.length < MIN_PASSWORD_LENGTH) {
             setError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
             return; 
        }
         if (newPassword === currentPassword) {
             setError('New password must be different from the current password.');
             return; 
         }
        

        const token = localStorage.getItem('token'); 
        
        if (!token) {
            navigate('/login-signup');
            return;
        }

         setIsLoading(true); 

        try {
            
            
            
            const response = await fetch(`${backendURL}/user/patch-password`, { 
                method: 'PATCH', 
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}`, 
                },
                body: JSON.stringify({ 
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                    
                }),
            });
            

            
            if (response.status === 401) { localStorage.removeItem('token'); navigate('/login-signup'); return; }

            
            
             if (response.status === 400 || response.status === 403) {
                 let errorMessage = 'Password update failed';
                 try {
                     const errorData = await response.json();
                     errorMessage = errorData.message || errorMessage;
                 } catch (jsonError) {
                      console.error("Failed to parse password update specific error response:", jsonError);
                 }
                 throw new Error(errorMessage); 
             }

            
            if (!response.ok) {
                 let errorMessage = `Failed to update password: ${response.status}`;
                  try {
                     const errorData = await response.json();
                     errorMessage = errorData.message || errorMessage;
                 } catch (jsonError) {
                     console.error("Failed to parse password update general error response:", jsonError);
                 }
                throw new Error(errorMessage); 
            }

            
            console.log("Password updated successfully via backend.");
            setSuccessMessage('Password updated successfully!'); 
            
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');

        } catch (err) {
            
            console.error("Error updating password:", err);
            setError(`Password update failed: ${err.message}`); 
             setSuccessMessage(''); 
        } finally {
            setIsLoading(false); 
        }
    };


    
    
    if (isLoading && (!currentUsername && !currentEmail)) { 
        return <div className="loading-indicator">Loading user data...</div>;
    }

    
    if (error && (!currentUsername && !currentEmail) && !isLoading) { 
         return <div className="error-message">Error loading user data: {error}</div>;
    }


    return (
        <div className="settings-container"> {}

            {}
            <button onClick={() => navigate('/home')} className="back-button">
                Back to Dashboard
            </button>
            {}

            <h2>User Settings</h2>

            {}
            {successMessage && <div className="alert success">{successMessage}</div>}
            {error && <div className="alert failure">{error}</div>}
             {}
             {isLoading && (currentUsername || currentEmail) && <div className="loading-indicator">Saving changes...</div>}


            {}
            <div className="settings-section">
                <h3>Update Profile Information</h3>
                {}
                <p>Current Username: <strong>{currentUsername}</strong></p>
                {}
                <p>Email: <strong>{currentEmail}</strong></p>

                <form onSubmit={handleUpdateProfile}>
                     {}
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

                    {}
                    {}

                    {}
                    <button
                        type="submit"
                        
                        
                        disabled={isLoading || newUsername.trim() === ''}
                    >
                        Update Username
                    </button>
                </form>
            </div> {}

            {}
             <div className="settings-section">
                <h3>Update Password</h3>
                <form onSubmit={handleUpdatePassword}>
                    {}
                    <div className='input-group'>
                        <label htmlFor="currentPassword">Current Password:</label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required 
                        />
                    </div>

                    {}
                    <div className='input-group'>
                        <label htmlFor="newPassword">New Password:</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required 
                             minLength={MIN_PASSWORD_LENGTH} 
                        />
                    </div>

                    {}
                    <div className='input-group'>
                        <label htmlFor="confirmNewPassword">Confirm New Password:</label>
                        <input
                            type="password"
                            id="confirmNewPassword"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required 
                             minLength={MIN_PASSWORD_LENGTH} 
                        />
                    </div>

                    {}
                    {passwordMatchError && <div className="error">{passwordMatchError}</div>}


                    {}
                    <button
                        type="submit"
                        
                        disabled={isLoading || !currentPassword || !newPassword || !confirmNewPassword}
                    >
                        Update Password
                    </button>
                </form>
            </div> {}

        </div> 
    );
}

export default UserSettingsPage;
