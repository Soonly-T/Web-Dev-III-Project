import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../App.css';

function LoginSignUpPage({ backendURL }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertClass, setAlertClass] = useState('');
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const mode = searchParams.get('mode');
    setIsLogin(mode !== 'signup');
  }, [searchParams]);

  const toggleSignUp = () => {
    setIsLogin(!isLogin);
    setPasswordMatchError('');
    setAlertMessage('');
    setAlertClass('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAlertMessage('');
    setAlertClass('');
    
    try {
      const response = await fetch(`${backendURL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginIdentifier: loginUsername,
          password: loginPassword,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token); // Store token in localStorage
      setAlertMessage('Login successful!');
      setAlertClass('success');
      navigate('/home'); // Navigate to home after successful login
    } catch (error) {
      setAlertMessage(`Login failed: ${error.message}`);
      setAlertClass('failure');
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setPasswordMatchError('');
    setAlertMessage('');
    setAlertClass('');

    if (signupPassword !== signupConfirmPassword) {
      setPasswordMatchError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${backendURL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: signupUsername,
          email: signupEmail,
          password: signupPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }

      const data = await response.json();
      setAlertMessage('Signup successful!');
      setAlertClass('success');
      navigate('/login-signup'); // Redirect to login page after signup
    } catch (error) {
      setAlertMessage(`Signup failed: ${error.message}`);
      setAlertClass('failure');
    }
  };

  return (
    <div className="login-signup-container">
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>

      {isLogin ? (
        <form className="login-signup" onSubmit={handleLoginSubmit}>
          <label>Username or Email</label>
          <input
            type="text"
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            required
          />
          <label>Password</label>
          <input
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
          <a
            href="#"
            className="signup-link"
            onClick={toggleSignUp}
          >
            Don't have an account? Sign Up
          </a>
        </form>
      ) : (
        <form className="login-signup" onSubmit={handleSignUpSubmit}>
          <label>Username</label>
          <input
            type="text"
            value={signupUsername}
            onChange={(e) => setSignupUsername(e.target.value)}
            required
          />
          <label>Email</label>
          <input
            type="email"
            value={signupEmail}
            onChange={(e) => setSignupEmail(e.target.value)}
            required
          />
          <label>Password</label>
          <input
            type="password"
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
            required
          />
          <label>Confirm Password</label>
          <input
            type="password"
            value={signupConfirmPassword}
            onChange={(e) => setSignupConfirmPassword(e.target.value)}
            required
          />
          {passwordMatchError && <div className="error">{passwordMatchError}</div>}
          <button type="submit">Sign Up</button>
          <a
            href="#"
            className="cancel"
            onClick={toggleSignUp}
          >
            Already have an account? Login
          </a>
        </form>
      )}

      {alertMessage && <div className={`alert ${alertClass}`}>{alertMessage}</div>}
    </div>
  );
}

export default LoginSignUpPage;
