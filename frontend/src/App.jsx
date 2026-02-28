import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ContactsPage from './pages/ContactsPage';
import ContactDetailsPage from './pages/ContactDetailsPage';
import LoginPage from './pages/LoginPage';
import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));

  function handleLogin() {
    setIsLoggedIn(true);
  }

  function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
  }

  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{
        duration: 3000,
        style: { background: '#fff', color: '#1f2937', border: '1px solid #e5e7eb' },
        success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
        error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
      }} />
      <Routes>
        {!isLoggedIn ? (
          <>
            <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
          </>
        ) : (
          <>
            <Route path="/" element={<ContactsPage onLogout={handleLogout} />} />
            <Route path="/contacts/:id" element={<ContactDetailsPage onLogout={handleLogout} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;