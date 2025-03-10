import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StartPage from './StartPage';
import SignupPage from './SignupPage';
import './index.css'; // Global styles

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* Add other routes/webpages here */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;