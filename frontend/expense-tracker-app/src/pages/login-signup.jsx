import '../App.css';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function LoginSignupPage({ backendURL }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState('');
  const [alertMessage, setAlertMessage] = useState(''); // State for alert messages
  const [alertClass, setAlertClass] = useState(''); // State for alert class
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const mode = searchParams.get('mode');
    setIsSignUp(mode === 'signup');
  }, [searchParams]);

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setPasswordMatchError('');
    setAlertMessage('');
    setAlertClass('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setAlertMessage('');
    setAlertClass('');
    fetch(`${backendURL}/login`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        loginIdentifier: loginIdentifier,
        password: password,
      }),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error(errorData.message || `Login failed with status: ${response.status}`);
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('Login successful:', data);
        localStorage.setItem('token', data.token); // Store the token in localStorage
        setAlertMessage('Login successful!');
        setAlertClass('success');
        navigate('/home'); 
      })
      .catch(error => {
        console.error('Login error:', error.message);
        setAlertMessage(`Login failed: ${error.message}`);
        setAlertClass('failure');
      });
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    setPasswordMatchError('');
    setAlertMessage('');
    setAlertClass('');

    if (signupPassword !== signupConfirmPassword) {
      setPasswordMatchError("Passwords do not match.");
      return;
    }

    fetch(`${backendURL}/signup`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: signupUsername,
        email: signupEmail,
        password: signupPassword,
      }),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error(errorData.message || `Signup failed with status: ${response.status}`);
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('Signup successful:', data);
        setAlertMessage('Signup successful!');
        setAlertClass('success');
        navigate('/login-signup'); // Redirect to login page after signup
      })
      .catch(error => {
        console.error('Signup error:', error.message);
        setAlertMessage(`Signup failed: ${error.message}`);
        setAlertClass('failure');
      });
  };

  return (
    <header className="App-header">
      <h1>Expense Tracker App</h1>
      <div className="login-field">
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!isSignUp) {
            handleLogin(e);
          } else {
            handleSignUp(e);
          }
        }}>
          {!isSignUp ? (
            <>
              <label name="loginIdentifier">Username or Email:</label>
              <br />
              <input
                type="text"
                name="loginIdentifier"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
              />
              <br />
              <br />
              <label name="password">Password:</label>
              <br />
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <br />

              <a onClick={toggleSignUp}>
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </a>
              <button type="submit">Sign In</button>
            </>
          ) : (
            <>
              <label name="signupUsername">Username:</label>
              <br />
              <input
                type="text"
                name="signupUsername"
                value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)}
              />
              <br />
              <br />
              <label name="signupEmail">Email:</label>
              <br />
              <input
                type="email"
                name="signupEmail"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
              />
              <br />
              <br />
              <label name="signupPassword">Password:</label>
              <br />
              <input
                type="password"
                name="signupPassword"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
              />
              <br />
              <br />
              <label name="signupConfirmPassword">Confirm Password:</label>
              <br />

              <input
                type="password"
                name="signupConfirmPassword"
                value={signupConfirmPassword}
                onChange={(e) => setSignupConfirmPassword(e.target.value)}
              />
              {passwordMatchError && <p style={{ color: 'red' }}>{passwordMatchError}</p>}
              <a onClick={toggleSignUp}>
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </a>
              <br />
              <br />
              <button type="submit">Sign Up</button>
            </>
          )}
        </form>
        <p className={`alert ${alertClass}`}>{alertMessage}</p>
      </div>
    </header>
  );
}

export default LoginSignupPage;