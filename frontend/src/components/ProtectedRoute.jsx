import { Navigate } from "react-router-dom"
import {jwtDecode} from "../utils/jwtDecode"
import api from "../api"
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants"
import { useState, useEffect } from "react"

function ProtectedRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        authenticate().catch(() => setIsAuthorized(false));
    }, []);

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);

        try {
            const response = await api.post("/auth/token/refresh/", { refresh: refreshToken });
            if(response.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, response.data.access);
                setIsAuthorized(true);
            }
        } catch (error) {
            console.log(error);
            setIsAuthorized(false);
        }
    }

    const authenticate = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if(!token) {
            setIsAuthorized(false);
            return;
        }

        const decoded = jwtDecode(token);
        const tokenExpired = decoded.exp;
        if(decoded.exp < Date.now() / 1000) {
            await refreshToken();
        }
        else {
            setIsAuthorized(true);
        }

    }

    if(isAuthorized === null) {
        return <div>Loading...</div>;
    }

    return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;