import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ContactsPage() {
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

  // Fetch contacts whenever search, filter, or ordering changes
  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (statusFilter) params.append('status', statusFilter);
    if (ordering) params.append('ordering', ordering);

    fetch(`http://127.0.0.1:8000/api/contacts/?${params}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setContactsData(data.results ? data.results : data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsError(true);
        setIsLoading(false);
      });
  }, [searchTerm, statusFilter, ordering]);

  function handleFormChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  function handleAddContact(event) {
    event.preventDefault();
    fetch('http://127.0.0.1:8000/api/contacts/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(createdContact => {
        setContactsData([createdContact, ...contactsData]);
        setFormData({ full_name: '', phone: '', email: '', status: 'active' });
        setShowAddForm(false);
      })
      .catch(() => alert('Failed to add contact. Check that name is at least 3 characters.'));
  }

  function handleDeleteContact(id) {
    if (!window.confirm('Are you sure you want to delete this contact and all their tasks?')) return;
    fetch(`http://127.0.0.1:8000/api/contacts/${id}/`, { method: 'DELETE' })
      .then(res => {
        if (res.ok || res.status === 204) {
          setContactsData(contactsData.filter(c => c.id !== id));
        }
      });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="max-w-full px-12 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">EXOS CRM</h1>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {showAddForm ? 'Cancel' : '+ New Contact'}
          </button>
        </div>
      </div>

      <div className="max-w-full px-12 py-6">
        {/* Add Contact Form */}
        {showAddForm && (
          <form onSubmit={handleAddContact} className="bg-white border border-blue-200 rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">New Contact</h2>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <input
                type="text" name="full_name" placeholder="Full Name *" required
                value={formData.full_name} onChange={handleFormChange}
                className="border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text" name="phone" placeholder="Phone"
                value={formData.phone} onChange={handleFormChange}
                className="border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="email" name="email" placeholder="Email"
                value={formData.email} onChange={handleFormChange}
                className="border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                name="status" value={formData.status} onChange={handleFormChange}
                className="border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition">
              Save Contact
            </button>
          </form>
        )}

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <input
                type="text" placeholder="Search by name, phone, or email..."
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              className="border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="-created_at">Newest First</option>
              <option value="created_at">Oldest First</option>
              <option value="full_name">Name A-Z</option>
              <option value="-full_name">Name Z-A</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            Failed to connect to the server. Make sure Django is running.
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-500">
            Loading contacts...
          </div>
        ) : contactsData.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-dashed border-gray-300 rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg">No contacts found</p>
            <p className="text-gray-400 text-sm mt-1">Add your first contact to get started</p>
          </div>
        ) : (
          /* Contacts Table */
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
                        contact.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{contact.open_tasks_count || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/contacts/${contact.id}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold mr-4"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="text-red-500 hover:text-red-700 font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}