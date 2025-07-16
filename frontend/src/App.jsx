import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';

function App() {
  return (
        <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<p>Welcome to the Collaborative Document Editor</p>} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
            </Routes>
        </div>
  );
}

export default App;