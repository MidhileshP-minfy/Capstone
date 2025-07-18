import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CollaborationProvider } from './contexts/CollaborationContext';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <CollaborationProvider>
          <Router>
            <App />
          </Router>
        </CollaborationProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);