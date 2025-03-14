import Form from "../components/LoginForm";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

function Login() {
    const navigate = useNavigate();
    return (
        <div className="login-container">
            <h1 className="login-title">Welcome Back to TasteBuds</h1>
            <Form route="/api/token/" method="login" />
        </div>
    );
}

export default Login;