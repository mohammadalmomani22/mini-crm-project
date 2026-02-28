import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ContactsPage from './pages/ContactsPage';
import ContactDetailsPage from './pages/ContactDetailsPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{
        duration: 3000,
        style: { background: '#fff', color: '#1f2937', border: '1px solid #e5e7eb' },
        success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
        error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
      }} />
      <Routes>
        <Route path="/" element={<ContactsPage />} />
        <Route path="/contacts/:id" element={<ContactDetailsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;