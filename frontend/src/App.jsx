import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/LoginPage'
import StartPage from './StartPage'
import NotFound from './pages/NotFound'
import './index.css' // Global styles
import HomePage from './pages/HomePage'
import Signup from './pages/SignupPage'
import ProtectedRoute from './components/ProtectedRoute'

function Logout()
{
  localStorage.clear()
  return <Navigate to="/login" />
}

function SignupAndLogout()
{
  localStorage.clear()
  return <Signup />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login/" element={<Login />} />
        <Route path="/" element={<StartPage />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/home/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/signup/" element={<SignupAndLogout />} />
        <Route path="/logout/" element={<Logout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;