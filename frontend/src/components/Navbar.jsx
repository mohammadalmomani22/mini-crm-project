import { Link } from 'react-router-dom';

export default function Navbar({ onLogout }) {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="max-w-full px-12 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <img src="/EXOS-logo.png" alt="EXOS" className="h-8" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mini CRM</h1>
            <p className="text-xs text-gray-500">Manage your contacts and tasks</p>
          </div>
        </Link>
        <button
          onClick={onLogout}
          className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}