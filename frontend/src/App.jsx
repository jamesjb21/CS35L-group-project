import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/LoginPage'
import StartPage from './StartPage'
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
    <ChakraBaseProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login/" element={<Layout><Login /></Layout>} />
          <Route path="/" element={<StartPage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/home/" element={<Layout><ProtectedRoute><HomePage /></ProtectedRoute></Layout>} />
          <Route path="/signup/" element={<Layout><SignupAndLogout /></Layout>} />
          <Route path="/logout/" element={<Logout />} /> 
          <Route path="/profile/" element={<Layout><Profile /></Layout>} /> 
          <Route path="/recipe/" element={<Layout><CreateRecipe /></Layout>} />
          <Route path="/search/" element={<Layout><Search /></Layout>} /> 

        </Routes>
      </BrowserRouter>
    </ChakraBaseProvider>
  );
}

export default App;