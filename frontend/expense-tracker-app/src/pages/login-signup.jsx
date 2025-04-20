import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './login-signup.css'; 

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

  
  const MIN_PASSWORD_LENGTH = 8; 

  
  
  
  useEffect(() => {
    const mode = searchParams.get('mode');
    
    setIsLogin(mode !== 'signup');
  }, [searchParams]); 

  
  
  
  const toggleSignUp = () => {
    setIsLogin(!isLogin); 
    
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

  
  const handleLoginSubmit = async (e) => {
    e.preventDefault(); 
    setAlertMessage(''); 
    setAlertClass(''); 
    setPasswordMatchError(''); 

    
    if (loginPassword.length < MIN_PASSWORD_LENGTH) {
        setAlertMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
        setAlertClass('failure'); 
        return; 
    }
    

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
      localStorage.setItem('token', data.token); 

      
      setAlertMessage('Login successful!');
      setAlertClass('success');
      navigate('/home'); 

    } catch (error) {
      
      console.error("Login Error:", error); 
      setAlertMessage(`Login failed: ${error.message}`); 
      setAlertClass('failure'); 
    }
  };

  
  const handleSignUpSubmit = async (e) => {
    e.preventDefault(); 
    setPasswordMatchError(''); 
    setAlertMessage(''); 
    setAlertClass(''); 

    
    if (signupPassword.length < MIN_PASSWORD_LENGTH) {
        setAlertMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
        setAlertClass('failure');
        return; 
    }
    

    
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

      
      setAlertMessage('Signup successful! Please log in.'); 
      setAlertClass('success');
      
      navigate('/login-signup', { replace: true });

    } catch (error) {
      
      console.error("Signup Error:", error); 
      setAlertMessage(`Signup failed: ${error.message}`); 
      setAlertClass('failure'); 
    }
  };

  
  return (
    <div className="login-signup-container">
      {}
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>

      {}
      {isLogin ? (
        
        <form className="login-signup" onSubmit={handleLoginSubmit}>
          <label htmlFor="loginUsername">Username or Email</label>
          <input
            type="text"
            id="loginUsername" 
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            required
          />

          <label htmlFor="loginPassword">Password</label>
          <input
            type="password"
            id="loginPassword" 
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
            minLength={MIN_PASSWORD_LENGTH} 
          />

          <button type="submit">Login</button>

          {}
          {}
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
        
        <form className="login-signup" onSubmit={handleSignUpSubmit}>
          <label htmlFor="signupUsername">Username</label>
          <input
            type="text"
            id="signupUsername" 
            value={signupUsername}
            onChange={(e) => setSignupUsername(e.target.value)}
            required
          />

          <label htmlFor="signupEmail">Email</label>
          <input
            type="email"
            id="signupEmail" 
            value={signupEmail}
            onChange={(e) => setSignupEmail(e.target.value)}
            required
          />

          <label htmlFor="signupPassword">Password</label>
          <input
            type="password"
            id="signupPassword" 
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
            required
            minLength={MIN_PASSWORD_LENGTH} 
          />

          <label htmlFor="signupConfirmPassword">Confirm Password</label>
          <input
            type="password"
            id="signupConfirmPassword" 
            value={signupConfirmPassword}
            onChange={(e) => setSignupConfirmPassword(e.target.value)}
            required
            minLength={MIN_PASSWORD_LENGTH} 
          />

          {}
          {passwordMatchError && <div className="error">{passwordMatchError}</div>}

          <button type="submit">Sign Up</button>

          {}
          {}
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

      {}
      {alertMessage && <div className={`alert ${alertClass}`}>{alertMessage}</div>}
    </div>
  );
}

export default LoginSignUpPage;