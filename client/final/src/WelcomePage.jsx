import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from './UserContext';
import "./welcomePage.css"
const WelcomePage = () => {
  const { userInfo } = useContext(UserContext);

  
  const isLoggedIn = userInfo && Object.keys(userInfo).length !== 0;

  return (
    <div className="welcome-page">
      {isLoggedIn ? (
        <><a href="http://localhost:3000/post" className="btn btn-primary">
        Go to Posts
      </a></>
        
      ) : (
        <>
          <h1>Welcome to Our Website</h1>
          <p>Please login or sign up to continue.</p>
          <div className="welcome-buttons">
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Sign Up
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default WelcomePage;
