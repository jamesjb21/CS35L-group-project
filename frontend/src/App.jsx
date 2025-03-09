import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import StartPage from './StartPage'
import NotFound from './pages/NotFound'
import './index.css' // Global styles
import HomePage from './pages/HomePage'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'

function Logout()
{
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout()
{
  localStorage.clear()
  return <Register />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<StartPage />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route Register path="/register" element={<RegisterAndLogout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;