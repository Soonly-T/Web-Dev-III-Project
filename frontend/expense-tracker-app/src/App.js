import './App.css';
import React, { useState } from 'react';

function App() {
  const [isSignUp, setIsSignUp] = useState(false);

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Expense Tracker App</h1>
        <div className="login-field">
          <form onSubmit={(e) => { e.preventDefault(); /* Handle sign in */ }}>
            {!isSignUp ? (
              <>
                <label name="loginIdentifier">Username or Email:</label>
                <br />
                <input type="text" name="loginIdentifier" />
                <br />
                <br />
                <label name="password">Password:</label>
                <br />
                <input type="password" name="password" />
                <br />

                <a onClick={toggleSignUp}>
            {isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
          </a>
                <button type="submit">Sign In</button>
              </>
            ) : (
              <>
                <label name="signupUsername">Username:</label>
                <br />
                <input type="text" name="signupUsername" />
                <br />
                <br />
                <label name="signupEmail">Email:</label>
                <br />
                <input type="email" name="signupEmail" />
                <br />
                <br />
                <label name="signupPassword">Password:</label>
                <br />
                <input type="password" name="signupPassword" />
                <br />
                <br />
                <label name="signupConfirmPassword">Confirm Password:</label>
                <br />
                
                <input type="password" name="signupConfirmPassword" />

                <a onClick={toggleSignUp}>
            {isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
          </a>                <br />                <br />
                <button type="submit">Sign Up</button>
              </>
            )}
          </form>

        </div>
      </header>
    </div>
  );
}

export default App;