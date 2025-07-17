import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-secondary-900 transition-colors">
      <header className="bg-white dark:bg-secondary-800 shadow-sm border-b border-primary-200 dark:border-secondary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-secondary-700 dark:text-primary-300 mr-2" />
              <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">DocSpace</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-secondary-700 dark:text-primary-200">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-secondary-600 dark:text-primary-300 hover:text-secondary-800 dark:hover:text-primary-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="dark:bg-secondary-900">{children}</main>
    </div>
  );
};

export default Layout;