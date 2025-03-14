import SignUpForm from "../components/SignupForm"
import React from 'react';
import '../styles/SignupPage.css';

function Signup() {
    return (
        <div className="signup-page">
            <h1 className="page-title">Join TasteBuds</h1>
            <SignUpForm route="/api/user/signup/" method="signup" />
        </div>
    );
}

export default Signup