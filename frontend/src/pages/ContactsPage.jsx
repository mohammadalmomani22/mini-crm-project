import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authFetch } from '../api';
import Navbar from '../components/Navbar';
import ConfirmModal from '../components/ConfirmModal';

export default function ContactsPage({ onLogout }) {
  const [contactsData, setContactsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '', phone: '', email: '', status: 'active'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (statusFilter) params.append('status', statusFilter);
    if (ordering) params.append('ordering', ordering);
    params.append('page', currentPage);

    authFetch(`/api/contacts/?${params}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setContactsData(data.results ? data.results : data);
        if (data.count) {
          setTotalPages(Math.ceil(data.count / 10));
        }
        setIsLoading(false);
        setIsError(false);
      })
      .catch(() => {
        setIsError(true);
        setIsLoading(false);
        toast.error('Failed to connect to server');
      });
  }, [searchTerm, statusFilter, ordering, currentPage]);

  function handleFormChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  function handleAddContact(event) {
    event.preventDefault();
    authFetch('/api/contacts/', {
      method: 'POST',
      body: JSON.stringify(formData)
    })
      .then(res => {
        if (!res.ok) return res.json().then(err => { throw err; });
        return res.json();
      })
      .then(createdContact => {
        setContactsData([createdContact, ...contactsData]);
        setFormData({ full_name: '', phone: '', email: '', status: 'active' });
        setShowAddForm(false);
        toast.success('Contact created successfully');
      })
      .catch((err) => {
        if (err.full_name) toast.error(`Name: ${err.full_name[0]}`);
        else if (err.phone) toast.error(`Phone: ${err.phone[0]}`);
        else if (err.email) toast.error(`Email: ${err.email[0]}`);
        else toast.error('Failed to add contact');
      });
  }

function handleDeleteContact(id) {
    setDeleteConfirm(id);
  }

  function confirmDelete() {
    authFetch(`/api/contacts/${deleteConfirm}/`, { method: 'DELETE' })
      .then(res => {
        if (res.ok || res.status === 204) {
          setContactsData(contactsData.filter(c => c.id !== deleteConfirm));
          toast.success('Contact deleted');
        }
      })
      .catch(() => toast.error('Failed to delete contact'))
      .finally(() => setDeleteConfirm(null));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={onLogout} />

      <div className="max-w-full px-12 py-6">
        {/* Page header with action button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Contacts</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {showAddForm ? 'Cancel' : '+ New Contact'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddContact} className="bg-white border border-blue-200 rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">New Contact</h2>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Full Name *</label>
                <input type="text" name="full_name" placeholder="Min 3 characters" required
                  value={formData.full_name} onChange={handleFormChange}
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Phone</label>
                <input type="text" name="phone" placeholder="+962..."
                  value={formData.phone} onChange={handleFormChange}
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
                <input type="email" name="email" placeholder="email@example.com"
                  value={formData.email} onChange={handleFormChange}
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleFormChange}
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition">
              Save Contact
            </button>
          </form>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <input type="text" placeholder="Search by name, phone, or email..."
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
            </div>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select value={ordering} onChange={(e) => { setOrdering(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="-created_at">Newest First</option>
              <option value="created_at">Oldest First</option>
              <option value="full_name">Name A-Z</option>
              <option value="-full_name">Name Z-A</option>
            </select>
          </div>
        </div>

        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            Failed to connect to the server. Make sure Django is running.
          </div>
        )}

        {isLoading ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-500">
            Loading contacts...
          </div>
        ) : contactsData.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg">No contacts found</p>
            <p className="text-gray-400 text-sm mt-1">Add your first contact to get started</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Open Tasks</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contactsData.map(contact => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{contact.full_name}</td>
                    <td className="px-6 py-4 text-gray-600">{contact.phone || '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{contact.email || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        contact.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{contact.open_tasks_count || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/contacts/${contact.id}`} className="text-blue-600 hover:text-blue-800 font-semibold mr-4">View</Link>
                      <button onClick={() => handleDeleteContact(contact.id)} className="text-red-500 hover:text-red-700 font-semibold">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 py-4 bg-white border-t border-gray-200">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold disabled:opacity-40 hover:bg-gray-50 transition"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold disabled:opacity-40 hover:bg-gray-50 transition"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {deleteConfirm && (
          <ConfirmModal
            message="This will permanently delete the contact and all their tasks."
            onConfirm={confirmDelete}
            onCancel={() => setDeleteConfirm(null)}
          />
        )}
    </div>
  );
}