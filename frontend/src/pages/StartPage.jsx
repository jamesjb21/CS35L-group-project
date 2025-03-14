import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/StartPage.css';

const StartPage = () => {
  const navigate = useNavigate();

  return (
    <div className="start-page-container">
      <header className="start-page-header">
        <div className="start-page-logo">TasteBuds</div>
        <div className="start-page-tagline">Finding Friends Through Food</div>
      </header>
      
      <div className="start-page-buttons">
        <button
          className="start-page-button start-page-login"
          onClick={() => navigate('/login')}
        >
          Login
        </button>
        <button
          className="start-page-button start-page-signup"
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </button>
      </div>
      
      <div className="start-page-features">
        <div className="start-page-feature">
          <div className="start-page-feature-icon">🍽️</div>
          <h3 className="start-page-feature-title">Share Recipes</h3>
          <p className="start-page-feature-description">Post your favorite recipes and cooking tips with friends.</p>
        </div>
        <div className="start-page-feature">
          <div className="start-page-feature-icon">👨‍🍳</div>
          <h3 className="start-page-feature-title">Find Foodies</h3>
          <p className="start-page-feature-description">Connect with people who share your culinary interests.</p>
        </div>
        <div className="start-page-feature">
          <div className="start-page-feature-icon">❤️</div>
          <h3 className="start-page-feature-title">Save Favorites</h3>
          <p className="start-page-feature-description">Bookmark recipes you love for easy access later.</p>
        </div>
      </div>
    </div>
  );
};

export default StartPage;
