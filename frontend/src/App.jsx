import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ContactsPage from './pages/ContactsPage';
import ContactDetailsPage from './pages/ContactDetailsPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The main CRM table page */}
        <Route path="/" element={<ContactsPage />} />
        
        {/* The specific contact details and tasks page */}
        <Route path="/contacts/:id" element={<ContactDetailsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;