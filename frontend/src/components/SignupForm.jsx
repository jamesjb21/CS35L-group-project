import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/SignupPage.css";

const SignUpForm = ({ route, method }) => {

  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({});

  const name = method === "login" ? "Login" : "Register";

  // Handle countdown effect after successful registration
  useEffect(() => {
    let timer;
    if (showSuccess && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (showSuccess && countdown === 0) {
      navigate("/login");
    }
    return () => clearTimeout(timer);
  }, [showSuccess, countdown, navigate]);

  const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setErrorMessage("");
      setErrors({});

      // Form validation
      const newErrors = {};
      if (!firstName) newErrors.firstName = "First name is required";
      if (!lastName) newErrors.lastName = "Last name is required";
      if (!username) newErrors.username = "Username is required";
      if (!password) newErrors.password = "Password is required";
      if (password && password.length < 8) newErrors.password = "Password must be at least 8 characters";

      if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          setLoading(false);
          return;
      }

      try {
          const res = await api.post(route, { firstName, lastName, username, password });
          console.log("API response:", res.data); // Log response

          if (method === "login") {
              localStorage.setItem(ACCESS_TOKEN, res.data.access);
              localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
              navigate("/home");
          } else {
              // Show success message and start countdown instead of immediate navigation
              setShowSuccess(true);
          }
      } catch (error) {
          console.error("API error:", error);
          
          // Handle different types of errors
          if (error.response) {
              // Server responded with an error status
              const responseData = error.response.data;
              
              // Handle Django REST Framework validation errors (usually in format: {"field": ["error message"]})
              if (responseData.username) setErrors(prev => ({ ...prev, username: responseData.username.join(' ') }));
              if (responseData.password) setErrors(prev => ({ ...prev, password: responseData.password.join(' ') }));
              if (responseData.firstName) setErrors(prev => ({ ...prev, firstName: responseData.firstName.join(' ') }));
              if (responseData.lastName) setErrors(prev => ({ ...prev, lastName: responseData.lastName.join(' ') }));
              
              // Handle non-field errors
              if (responseData.non_field_errors) {
                  setErrorMessage(responseData.non_field_errors.join(' '));
              } else if (responseData.detail) {
                  setErrorMessage(responseData.detail);
              } else if (typeof responseData === 'string') {
                  setErrorMessage(responseData);
              } else if (!Object.keys(errors).length) {
                  // If we haven't set any field-specific errors but there was a server error
                  setErrorMessage("Server error. Please try again later.");
              }
          } else if (error.request) {
              // Request was made but no response received (network error)
              setErrorMessage("No response from server. Please check your internet connection and try again.");
          } else {
              // Something else happened while setting up the request
              setErrorMessage("An error occurred. Please try again.");
          }
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="signup-container">
      {showSuccess ? (
        <div className="success-message">
          <div className="success-content">
            <h2>Registration Successful!</h2>
            <p>Your account has been created successfully.</p>
            <p>Redirecting to login page in {countdown} seconds...</p>
          </div>
        </div>
      ) : (
        <div className="signup-content">
          <div className="signup-image">
            <img src="/signup.png" alt="Sign Up" className="banner-image" />
          </div>

          <div className="signup-form-container">
            <div className="form-wrapper">
              <h2 className="signup-title">Create your free account now!</h2>
              
              {/* General error message */}
              {errorMessage && (
                <div className="error-message">
                  {errorMessage}
                </div>
              )}
              
              <form className="signup-form" onSubmit={handleSubmit}>
                <div className="name-row">
                  <div className="form-group">
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                      className={`form-input ${errors.firstName ? 'input-error' : ''}`}
                    />
                    {errors.firstName && <div className="error-text">{errors.firstName}</div>}
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last Name"
                      className={`form-input ${errors.lastName ? 'input-error' : ''}`}
                    />
                    {errors.lastName && <div className="error-text">{errors.lastName}</div>}
                  </div>
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className={`form-input ${errors.username ? 'input-error' : ''}`}
                  />
                  {errors.username && <div className="error-text">{errors.username}</div>}
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className={`form-input ${errors.password ? 'input-error' : ''}`}
                  />
                  {errors.password && <div className="error-text">{errors.password}</div>}
                </div>
                <button type="submit" className="signup-button" disabled={loading}>
                  {loading ? "Processing..." : name}
                </button>
              </form>

              <div className="divider">
                <span className="divider-line"></span>
                <span className="divider-text">Or</span>
                <span className="divider-line"></span>
              </div>

              <button className="login-button" onClick={() => navigate("/login")}>
                Log In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUpForm;

