import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/SignupPage.css";

const SignUpForm = ({ route, method }) => {

  const navigate = useNavigate();
  const name = method === "login" ? "Login" : "Signup";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(" Form submitted!"); // Confirm function runs
    console.log(" API route:", route);
    console.log("Data:", { firstName, lastName, email, password });
    setLoading(true);
    setError("");

    if (firstName === "" || lastName === "" || email === ""|| password === "" ) {
      console.log("Please fill in all fields.");
      setLoading(false);
    }
  
    try {
      const res = await api.post(route, {firstName, lastName, email, password});
  
      console.log("API response:", res.data); // Log API respons
      navigate("/login");
    } catch (error) {
      console.error("API error:"); // Log API error response
      setError(error.response?.data?.message || "An error occurred. Please try again.");
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
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
