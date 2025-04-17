import '../App.css';
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link

function HomePage() {
  return (
    <header className="App-header">
      <h1>Expense Tracker App</h1>
      {/* Link to the Login page (isSignUp will be false by default) */}
      <Link to="/login-signup">Login</Link>
      {/* Link to the Signup page (we'll pass a parameter to set isSignUp to true) */}
      <Link to="/login-signup?mode=signup">Signup</Link>
    </header>
  );
}

export default HomePage;