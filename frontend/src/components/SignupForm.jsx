import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/SignupPage.css";

const SignUpForm = ({ route, method }) => {
  const navigate = useNavigate();
  const name = method === "login" ? "Login" : "Register";
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = async (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post(route, {
        firstname: formData.firstName,
        lastname: formData.lastName,
        email: formData.email,
        password: formData.password,
      });

      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/home");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
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

            {error && <p className="error-message">{error}</p>}

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
