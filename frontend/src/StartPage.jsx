import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StartPage.css';

const StartPage = () => {
  const navigate = useNavigate();

  return (
    <div className="start-page-container">
      {/* Left Side */}
      <div className="start-page-left">
        {/* Header: Logo and App Name in the top left */}
        <div className="header-container">
          <div className="logo-container">
            <img 
              src="/images/logo.jpeg" // Path to logo in public/images
              alt="TasteBuds Logo" 
              className="logo" 
            />
            <h1 className="app-name">TasteBuds</h1>
          </div>
        </div>

        {/* Main Content: Catchphrase and Button, centered */}
        <div className="content-container">
          <div className="catchphrase-container">
            <h2 className="catchphrase">Your Culinary Community</h2>
            <p className="app-description">
              Share, discover, and connect with food lovers around the world.
            </p>
          </div>
          <button
            className="start-page-button"
            onClick={() => navigate('/login')}
          >
            Login or Get Started
          </button>
        </div>
      </div>

      {/* Right Side */}
      <div className="start-page-right">
        <img 
          src="/images/banner.jpeg" // Path to banner in public/images
          alt="Cooking Banner" 
          className="banner-image" 
        />
      </div>
    </div>
  );
};

export default StartPage;
