import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import { ACCESS_TOKEN } from '../constants';
import { jwtDecode } from 'jwt-decode';

const Layout = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        // Check if token is expired
        const decoded = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000;

        if (tokenExpiration < now) {
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // Listen for storage events to detect when token is removed (logout)
    const handleStorageChange = (e) => {
      if (e.key === ACCESS_TOKEN) {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check auth status whenever the component re-renders
    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="layout">
      {isAuthenticated && <Navbar />}
      <main className="layout-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;