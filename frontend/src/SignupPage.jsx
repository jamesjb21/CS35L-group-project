import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignupPage.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // TODO: Replace with actual API call when backend is ready
    try {
      console.log('Submitting user data:', formData);
      // Simulate successful signup
      alert('Account created successfully!');
      navigate('/home');
    } catch (error) {
      console.error('Signup error:', error);
      alert('Failed to create account. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        <div className="signup-image">
          <img 
            src="/public/signup.png"
            alt="Cooking Banner" 
            className="banner-image"
          />
        </div>
        
        <div className="signup-form-container">
          <div className="form-wrapper">
            <h1 className="signup-title">Create your free account now!</h1>
            
            <form className="signup-form" onSubmit={handleSubmit}>
              <div className="name-row">
                <div className="form-group">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    required
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="form-input"
                  minLength="8"
                />
              </div>
              
              <button type="submit" className="signup-button">
                Register Now
              </button>
            </form>
            
            <div className="divider">
              <span className="divider-line"></span>
              <span className="divider-text">Or</span>
              <span className="divider-line"></span>
            </div>
            
            <button 
              className="login-button"
              onClick={() => navigate('/login')}
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
