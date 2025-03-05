import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StartPage from './StartPage';
import './index.css'; // Global styles

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />
        {/* Add other routes/webpages here */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;