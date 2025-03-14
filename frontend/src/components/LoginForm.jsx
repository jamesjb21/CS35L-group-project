import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/LoginPage.css";

const LoginForm = ({ route, method }) => {

  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({});

  const name = method === "login" ? "Login" : "Register";

  const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setErrorMessage("");
      setErrors({});

      // Form validation
      const newErrors = {};
      if (!username) newErrors.username = "Username is required";
      if (!password) newErrors.password = "Password is required";

      if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          setLoading(false);
          return;
      }

      try {
          const res = await api.post(route, { username, password });
          console.log("API response:", res.data); // Log response

          if (method === "login") {
              localStorage.setItem(ACCESS_TOKEN, res.data.access);
              localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
              navigate("/home");
          } else {
              navigate("/login");
          }
      } catch (error) {
          console.error("API error:", error);
          
          // Handle different types of errors
          if (error.response) {
              // Server responded with an error status
              const responseData = error.response.data;
              const status = error.response.status;
              
              // Handle common login errors
              if (status === 401 || status === 400) {
                  setErrorMessage("Invalid username or password. Please try again.");
              } 
              // Handle Django REST Framework validation errors
              else if (responseData.username) {
                  setErrors(prev => ({ ...prev, username: responseData.username.join(' ') }));
              } else if (responseData.password) {
                  setErrors(prev => ({ ...prev, password: responseData.password.join(' ') }));
              } 
              // Handle non-field errors
              else if (responseData.non_field_errors) {
                  setErrorMessage(responseData.non_field_errors.join(' '));
              } else if (responseData.detail) {
                  setErrorMessage(responseData.detail);
              } else if (typeof responseData === 'string') {
                  setErrorMessage(responseData);
              } else {
                  // Fallback error message
                  setErrorMessage("Login failed. Please check your credentials and try again.");
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
      <div className="signup-content">
        <div className="signup-form-container">
          <div className="form-wrapper">
            <h1 className="signup-title">Login</h1>
            
            {/* General error message */}
            {errorMessage && (
              <div className="error-message">
                {errorMessage}
              </div>
            )}
            
            <form className="signup-form" onSubmit={handleSubmit}>
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

            <button className="login-button" onClick={() => navigate("/signup")}>
              Dont Have an Account? Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

