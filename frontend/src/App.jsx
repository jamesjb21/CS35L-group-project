import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StartPage from './pages/StartPage';
import Login from './pages/login';
import Register from './pages/register';
import notFound from './pages/notFound';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css'; // Global styles
import HomePage from './pages/HomePage';

function Logout () {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="*" element={<notFound />} />
        <Route path="/homepage" element={<ProtectedRoute> <HomePage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;