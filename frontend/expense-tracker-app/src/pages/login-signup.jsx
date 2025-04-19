import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../App.css'; // Assuming App.css contains your styles

function LoginSignUpPage({ backendURL }) {
  // --- State Variables ---
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup views

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Validation and alert states
  const [passwordMatchError, setPasswordMatchError] = useState(''); // Specific error for password mismatch
  const [alertMessage, setAlertMessage] = useState(''); // General alert message (success or failure)
  const [alertClass, setAlertClass] = useState(''); // CSS class for alert message ('success' or 'failure')

  // Navigation hook
  const navigate = useNavigate();
  // Hook to read URL search parameters (like ?mode=signup)
  const [searchParams] = useSearchParams();

  // --- Constants ---
  const MIN_PASSWORD_LENGTH = 8; // Define minimum password length

  // --- Effect Hook to Set Mode from URL ---
  // Checks the URL search params on component mount or search param change
  // to determine if the page should start in login or signup mode.
  useEffect(() => {
    const mode = searchParams.get('mode');
    // If mode is 'signup', set to signup; otherwise, default to login.
    setIsLogin(mode !== 'signup');
  }, [searchParams]); // Effect depends on searchParams

  // --- Toggle Function ---
  // Switches between login and signup forms.
  // Clears validation errors and alerts when switching.
  const toggleSignUp = () => {
    setIsLogin(!isLogin); // Flip the boolean state
    // Clear fields, errors, and alerts when switching forms
    setLoginUsername('');
    setLoginPassword('');
    setSignupUsername('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupConfirmPassword('');
    setPasswordMatchError('');
    setAlertMessage('');
    setAlertClass('');
  };

  // --- Login Submission Handler ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault(); // Prevent default form refresh
    setAlertMessage(''); // Clear previous alert
    setAlertClass(''); // Clear previous alert class
    setPasswordMatchError(''); // Clear password mismatch error

    // --- Validation: Password Length ---
    if (loginPassword.length < MIN_PASSWORD_LENGTH) {
        setAlertMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
        setAlertClass('failure'); // Assuming 'failure' class styles error alerts
        return; // Stop the submission process
    }
    // -------------------------------

    try {
      // Send POST request to the login endpoint
      const response = await fetch(`${backendURL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // Indicate JSON body
        body: JSON.stringify({
          loginIdentifier: loginUsername, // Use username or email as identifier
          password: loginPassword,
        }),
      });

      // Check if the response status is not OK (indicating an error)
      if (!response.ok) {
        const errorData = await response.json(); // Attempt to read error message from body
        throw new Error(errorData.message || 'Login failed'); // Throw an error with message
      }

      // If login is successful, parse the JSON response
      const data = await response.json();
      localStorage.setItem('token', data.token); // Store the received JWT token in local storage

      // Display success message and navigate
      setAlertMessage('Login successful!');
      setAlertClass('success');
      navigate('/home'); // Redirect to the dashboard or home page

    } catch (error) {
      // Catch any errors during fetch or processing
      console.error("Login Error:", error); // Log error to console
      setAlertMessage(`Login failed: ${error.message}`); // Display error message to user
      setAlertClass('failure'); // Set alert class to failure
    }
  };

  // --- Signup Submission Handler ---
  const handleSignUpSubmit = async (e) => {
    e.preventDefault(); // Prevent default form refresh
    setPasswordMatchError(''); // Clear previous password mismatch error
    setAlertMessage(''); // Clear previous alert
    setAlertClass(''); // Clear previous alert class

    // --- Validation: Password Length ---
    if (signupPassword.length < MIN_PASSWORD_LENGTH) {
        setAlertMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
        setAlertClass('failure');
        return; // Stop the submission process
    }
    // -------------------------------

    // --- Validation: Password Match (Already present) ---
    if (signupPassword !== signupConfirmPassword) {
      setPasswordMatchError("Passwords do not match."); // Set specific mismatch error state
      // No need to set general alert here, passwordMatchError div handles display
      return; // Stop the submission process
    }
    // -------------------------------------------------

    try {
      // Send POST request to the signup endpoint
      const response = await fetch(`${backendURL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // Indicate JSON body
        body: JSON.stringify({
          username: signupUsername,
          email: signupEmail,
          password: signupPassword, // Send the main password
        }),
      });

      // Check if the response status is not OK
      if (!response.ok) {
        const errorData = await response.json(); // Attempt to read error message
        throw new Error(errorData.message || 'Signup failed'); // Throw an error with message
      }

      // If signup is successful, parse the response
      const data = await response.json(); // Backend might return user data or success message

      // Display success message and redirect to login page
      setAlertMessage('Signup successful! Please log in.'); // Inform user to log in
      setAlertClass('success');
      // Use replace: true to prevent going back to signup page with browser back button
      navigate('/login-signup', { replace: true });

    } catch (error) {
      // Catch any errors during fetch or processing
      console.error("Signup Error:", error); // Log error to console
      setAlertMessage(`Signup failed: ${error.message}`); // Display error message to user
      setAlertClass('failure'); // Set alert class to failure
    }
  };

  // --- Render Component ---
  return (
    <div className="login-signup-container">
      {/* Dynamic heading based on current mode */}
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>

      {/* Conditionally render Login form or Signup form */}
      {isLogin ? (
        // --- Login Form ---
        <form className="login-signup" onSubmit={handleLoginSubmit}>
          <label htmlFor="loginUsername">Username or Email</label>
          <input
            type="text"
            id="loginUsername" // Link label to input
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            required
          />

          <label htmlFor="loginPassword">Password</label>
          <input
            type="password"
            id="loginPassword" // Link label to input
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
            minLength={MIN_PASSWORD_LENGTH} // Add minLength attribute for browser validation hint
          />

          <button type="submit">Login</button>

          {/* Link to switch to Signup form */}
          {/* Using role="button" and aria-label for accessibility on non-link behavior */}
          <a
            href="#"
            className="signup-link"
            onClick={toggleSignUp}
            role="button"
            aria-label="Switch to Sign Up form"
          >
            Don't have an account? Sign Up
          </a>
        </form>

      ) : (
        // --- Sign Up Form ---
        <form className="login-signup" onSubmit={handleSignUpSubmit}>
          <label htmlFor="signupUsername">Username</label>
          <input
            type="text"
            id="signupUsername" // Link label to input
            value={signupUsername}
            onChange={(e) => setSignupUsername(e.target.value)}
            required
          />

          <label htmlFor="signupEmail">Email</label>
          <input
            type="email"
            id="signupEmail" // Link label to input
            value={signupEmail}
            onChange={(e) => setSignupEmail(e.target.value)}
            required
          />

          <label htmlFor="signupPassword">Password</label>
          <input
            type="password"
            id="signupPassword" // Link label to input
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
            required
            minLength={MIN_PASSWORD_LENGTH} // Add minLength attribute for browser validation hint
          />

          <label htmlFor="signupConfirmPassword">Confirm Password</label>
          <input
            type="password"
            id="signupConfirmPassword" // Link label to input
            value={signupConfirmPassword}
            onChange={(e) => setSignupConfirmPassword(e.target.value)}
            required
            minLength={MIN_PASSWORD_LENGTH} // Add minLength attribute for browser validation hint
          />

          {/* Display password mismatch error if state is set */}
          {passwordMatchError && <div className="error">{passwordMatchError}</div>}

          <button type="submit">Sign Up</button>

          {/* Link to switch back to Login form */}
          {/* Using role="button" and aria-label for accessibility on non-link behavior */}
           <a
            href="#"
            className="cancel"
            onClick={toggleSignUp}
            role="button"
            aria-label="Switch to Login form"
          >
            Already have an account? Login
          </a>
        </form>
      )}

      {/* Display general alert message if state is set */}
      {alertMessage && <div className={`alert ${alertClass}`}>{alertMessage}</div>}
    </div>
  );
}

export default LoginSignUpPage;