import './App.css';
import React from 'react';
import LoginSignupPage from './pages/login-signup';
import { Link, Route, Routes } from 'react-router-dom'; // Import necessary components, but NOT Router
import HomePage from './pages/home';
import DashboardScreen from './pages/dashboardScreen';
import UserSettingsPage from './pages/UserSettingsPage';

const BACKEND_URL = 'http://localhost:3060';
function App() {
  return (
    <div> {/* Just wrap your content in a regular div or React.Fragment */}
      {/* <Link to="/login-signup">Login/Signup</Link> */}

      <Routes>
      <Route path="/" element={<HomePage  />} />
        <Route path="/login-signup" element={<LoginSignupPage backendURL={BACKEND_URL} />} />
        <Route path="/home" element={<DashboardScreen backendURL={BACKEND_URL} />} />
        <Route path="/modify-user" element={<UserSettingsPage backendURL={BACKEND_URL} />}></Route>
        {/* You can add more routes here */}
      </Routes>
    </div>
  );  
}

export default App;