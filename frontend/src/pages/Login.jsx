import Form from "../components/Form";
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();
    return (
        <div>
            <Form route="/api/token/" method="login" />
            <div className="toMakeAccount">
                <h3>Dont have an account?</h3>
                <button className="toRegister" onClick={() => navigate('/register')}>Register an account</button>
            </div>
        </div>
    );
}

export default Login;