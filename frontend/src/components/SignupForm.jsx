import { useState } from "react";
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

  const name = method === "login" ? "Login" : "Register";

  const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      // Prevent empty submissions
      if (!username || !password || !firstName || !lastName) {
          alert("Please enter both username and password.");
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
              navigate("/login");
          }
      } catch (error) {
          console.error("API error:", error.response?.data || error.message);
          alert(error.response?.data?.message || "An error occurred. Please try again.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        <div className="signup-image">
          <img src="/signup.png" alt="Sign Up" className="banner-image" />
        </div>

        <div className="signup-form-container">
          <div className="form-wrapper">
            <h1 className="signup-title">Create your free account now!</h1>
            <form className="signup-form" onSubmit={handleSubmit}>
              <div className="name-row">
              <div className="form-group">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="form-input"
                />
              </div>
              <button type="submit" className="signup-button">
                {name}
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
    </div>
  );
};

export default SignUpForm;

