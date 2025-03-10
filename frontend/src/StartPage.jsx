import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StartPage.css';

const StartPage = () => {
  const navigate = useNavigate();

  return (
    <div className="start-page">
      <header className="header">
        <div className="logo-container">
          <img 
            src="/public/logo.png" 
            alt="TasteBuds Logo" 
            className="logo" 
          />
          <h1 className="title">TasteBuds</h1>
        </div>
      </header>
      <main className="main-content">
        <h2 className="main-heading">Finding Friends Through Food</h2>
        <p className="subheading">Flavors worth sharing</p>
        <button
          className="join-button"
          onClick={() => navigate('/signup')}
        >
          Join Now
        </button>
      </main>
    </div>
  );
};

export default StartPage;
