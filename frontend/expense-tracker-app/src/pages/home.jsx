import '../App.css'; // Keep App.css import for global styles like body
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link

// Import the CSS file for Home page specific styles
import './home.css'; // Make sure this path is correct

/**
 * Simple Home page component with app title and links to login/signup.
 * Redesigned with a structural change (added separator).
 */
function HomePage() {
  return (
    // Main container for the home page content
    <div className="home-container">

      {/* Simple icon at the top */}
      {/* Using inline SVG for a simple graphic element */}
      <svg className="home-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.41L12 14.99l-1.41 1.42L9.17 15 12 12.17 14.83 15 13.41 16.41zM12 10.83L9.17 8 10.59 6.59 12 8l1.41-1.41L14.83 8 12 10.83z"/>
      </svg>

      {/* Main heading */}
      <h1>Expense Tracker App</h1>

      {/* Introductory paragraph */}
      <p>
        Effortlessly manage your personal finances. Track expenses, categorize spending, and gain clear insights.
      </p>

      {/* --- Structural Change: Add a horizontal rule for separation --- */}
      {/* You might need to add specific styles for hr in home.css */}
      <hr className="home-separator"/>
      {/* ------------------------------------------------------------- */}

      {/* Container for the buttons */}
      <div className="home-buttons">
          {/* Links styled as buttons */}
          <Link to="/login-signup" className="home-link">Login</Link>
          <Link to="/login-signup?mode=signup" className="home-link">Sign Up</Link>
      </div>

    </div> // End .home-container
  );
}

export default HomePage;
