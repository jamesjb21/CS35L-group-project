import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/LoginPage'
import StartPage from './pages/StartPage'
import NotFound from './pages/NotFound'
import './index.css' // Global styles
import HomePage from './pages/HomePage'
import Signup from './pages/SignupPage'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/layout'
import { ChakraBaseProvider } from '@chakra-ui/react'
import Search from './pages/Search'
import Profile from './pages/Profile'
import CreateRecipe from './pages/CreateRecipe'
import Explore from './pages/Explore'
import { ACCESS_TOKEN } from './constants'

// Explicit logout component - only triggered when user clicks logout
function Logout() {
  console.log("Logout component mounted - clearing localStorage");
  localStorage.removeItem(ACCESS_TOKEN) // Only remove the token, not all localStorage
  return <Navigate to="/login" />
}

function SignupAndLogout() {
  console.log("SignupAndLogout component mounted");
  localStorage.removeItem(ACCESS_TOKEN) // Only remove the token, not all localStorage
  return <Signup />
}
  
function App() {
  console.log("App rendering - current access token:", localStorage.getItem(ACCESS_TOKEN) ? "exists" : "none");
  
  return (
    <ChakraBaseProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/" element={<StartPage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/home" element={<Layout><ProtectedRoute><HomePage /></ProtectedRoute></Layout>} />
          <Route path="/signup" element={<Layout><SignupAndLogout /></Layout>} />
          <Route path="/logout" element={<Logout />} /> 
          <Route path="/profile" element={<Layout><ProtectedRoute><Profile /></ProtectedRoute></Layout>} />
          <Route path="/profile/:username" element={<Layout><ProtectedRoute><Profile /></ProtectedRoute></Layout>} />
          <Route path="/create" element={<Layout><ProtectedRoute><CreateRecipe /></ProtectedRoute></Layout>} />
          <Route path="/search" element={<Layout><ProtectedRoute><Search /></ProtectedRoute></Layout>} /> 
          <Route path="/explore" element={<Layout><ProtectedRoute><Explore /></ProtectedRoute></Layout>} />
        </Routes>
      </BrowserRouter>
    </ChakraBaseProvider>
  );
}

export default App;