import Form from "../components/LoginForm";
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();
    return (
        <div>
            <Form route="/api/token/" method="login" />
            <div className="toMakeAccount">
                <h3>Dont have an account?</h3>
                <button className="toSignup" onClick={() => navigate('/signup')}>Sign up now!</button>
            </div>
        </div>
    );
}

export default Login;