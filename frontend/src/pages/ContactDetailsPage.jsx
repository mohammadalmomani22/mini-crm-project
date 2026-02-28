import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authFetch } from '../api';
import Navbar from '../components/Navbar';
import ConfirmModal from '../components/ConfirmModal';

export default function ContactDetailsPage({ onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contact, setContact] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    full_name: '', phone: '', email: '', status: 'active'
  });

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', due_date: '', priority: 'medium' });

  const [taskStatusFilter, setTaskStatusFilter] = useState('');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState('');

  const [deleteContactConfirm, setDeleteContactConfirm] = useState(false);
  const [deleteTaskConfirm, setDeleteTaskConfirm] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      authFetch(`/api/contacts/${id}/`).then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      }),
      authFetch(`/api/tasks/?contact_id=${id}&page_size=100`).then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
    ])
      .then(([contactData, tasksData]) => {
        setContact(contactData);
        setEditData({
          full_name: contactData.full_name,
          phone: contactData.phone || '',
          email: contactData.email || '',
          status: contactData.status
        });
        setTasks(tasksData.results ? tasksData.results : tasksData);
        setIsLoading(false);
      })
      .catch(() => {
        setIsError(true);
        setIsLoading(false);
        toast.error('Failed to load contact');
      });
  }, [id]);

  function handleEditChange(event) {
    setEditData({ ...editData, [event.target.name]: event.target.value });
  }

  function handleEditSubmit(event) {
    event.preventDefault();
    authFetch(`/api/contacts/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(editData)
    })
      .then(res => {
        if (!res.ok) return res.json().then(err => { throw err; });
        return res.json();
      })
      .then(updatedContact => {
        setContact(updatedContact);
        setIsEditing(false);
        toast.success('Contact updated');
      })
      .catch((err) => {
        if (err.full_name) toast.error(`Name: ${err.full_name[0]}`);
        else if (err.phone) toast.error(`Phone: ${err.phone[0]}`);
        else toast.error('Failed to update contact');
      });
  }

  function handleDeleteContact() {
    setDeleteContactConfirm(true);
  }

  function confirmDeleteContact() {
    authFetch(`/api/contacts/${id}/`, { method: 'DELETE' })
      .then(res => {
        if (res.ok || res.status === 204) {
          toast.success('Contact deleted');
          navigate('/');
        }
      })
      .catch(() => toast.error('Failed to delete contact'))
      .finally(() => setDeleteContactConfirm(false));
  }

  function handleDeleteTask(taskId) {
    setDeleteTaskConfirm(taskId);
  }

  function confirmDeleteTask() {
    authFetch(`/api/tasks/${deleteTaskConfirm}/`, { method: 'DELETE' })
      .then(res => {
        if (res.ok || res.status === 204) {
          setTasks(tasks.filter(t => t.id !== deleteTaskConfirm));
          toast.success('Task deleted');
        }
      })
      .catch(() => toast.error('Failed to delete task'))
      .finally(() => setDeleteTaskConfirm(null));
  }
  function handleTaskChange(event) {
    setNewTask({ ...newTask, [event.target.name]: event.target.value });
  }

  function handleSubmitTask(event) {
    event.preventDefault();
    const taskPayload = {
      ...newTask,
      contact: parseInt(id),
      due_date: newTask.due_date === '' ? null : newTask.due_date
    };

    authFetch('/api/tasks/', {
      method: 'POST',
      body: JSON.stringify(taskPayload)
    })
      .then(res => {
        if (!res.ok) return res.json().then(err => { throw err; });
        return res.json();
      })
      .then(createdTask => {
        setTasks([createdTask, ...tasks]);
        setNewTask({ title: '', due_date: '', priority: 'medium' });
        setShowTaskForm(false);
        toast.success('Task added');
      })
      .catch((err) => {
        if (err.title) toast.error(Array.isArray(err.title) ? err.title[0] : err.title);
        else if (err.due_date) toast.error(Array.isArray(err.due_date) ? err.due_date[0] : err.due_date);
        else if (err.non_field_errors) toast.error(err.non_field_errors[0]);
        else toast.error('Failed to add task');
      });
  }

  function handleToggleDone(task) {
    authFetch(`/api/tasks/${task.id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_done: !task.is_done })
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(updatedTask => {
        setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
        toast.success(updatedTask.is_done ? 'Task completed' : 'Task reopened');
      })
      .catch(() => toast.error('Failed to update task'));
  }

  const filteredTasks = tasks.filter(task => {
    if (taskStatusFilter === 'done' && !task.is_done) return false;
    if (taskStatusFilter === 'pending' && task.is_done) return false;
    if (taskPriorityFilter && task.priority !== taskPriorityFilter) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onLogout={onLogout} />
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500 text-lg">Loading contact details...</p>
        </div>
      </div>
    );
  }

  if (isError || !contact) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onLogout={onLogout} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-4">Failed to load contact.</p>
            <Link to="/" className="text-blue-600 hover:underline font-semibold">Back to Contacts</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={onLogout} />

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
        {/* Page-specific actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <Link to="/" className="text-blue-600 hover:text-blue-800 font-semibold">
            &larr; Back to Contacts
          </Link>
          <div className="flex gap-3">
            <button onClick={() => setIsEditing(!isEditing)}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition">
              {isEditing ? 'Cancel' : 'Edit Contact'}
            </button>
            <button onClick={handleDeleteContact}
              className="border border-red-300 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition">
              Delete Contact
            </button>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="bg-white border border-yellow-200 rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Edit Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Full Name</label>
                <input type="text" name="full_name" required value={editData.full_name} onChange={handleEditChange}
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Status</label>
                <select name="status" value={editData.status} onChange={handleEditChange}
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
                <input type="email" name="email" value={editData.email} onChange={handleEditChange}
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Phone</label>
                <input type="text" name="phone" value={editData.phone} onChange={handleEditChange}
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
              Save Changes
            </button>
          </form>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{contact.full_name}</h1>
                <p className="text-sm text-gray-400 mt-1">Contact ID: {contact.id}</p>
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                contact.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {contact.status}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-100 pt-4">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Email</p>
                <p className="text-gray-800 mt-1">{contact.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Phone</p>
                <p className="text-gray-800 mt-1">{contact.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Open Tasks</p>
                <p className="text-gray-800 mt-1 font-bold">{contact.open_tasks_count || 0}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Tasks</h2>
          <button onClick={() => setShowTaskForm(!showTaskForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
            {showTaskForm ? 'Cancel' : '+ Add Task'}
          </button>
        </div>

        {showTaskForm && (
          <form onSubmit={handleSubmitTask} className="bg-white border border-blue-200 rounded-lg p-5 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Task Title *</label>
                <input type="text" name="title" placeholder="Min 3 characters" required
                  value={newTask.title} onChange={handleTaskChange}
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Due Date</label>
                <input type="date" name="due_date" value={newTask.due_date} onChange={handleTaskChange}
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Priority</label>
                <select name="priority" value={newTask.priority} onChange={handleTaskChange}
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition">
              Save Task
            </button>
          </form>
        )}

        <div className="flex gap-3 mb-4">
          <select value={taskStatusFilter} onChange={(e) => setTaskStatusFilter(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="done">Completed</option>
          </select>
          <select value={taskPriorityFilter} onChange={(e) => setTaskPriorityFilter(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-lg p-10 text-center">
            <p className="text-gray-500">No tasks found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <div key={task.id} className={`bg-white border rounded-lg p-4 shadow-sm flex justify-between items-center ${
                task.is_done ? 'border-green-200 bg-green-50' : 'border-gray-200'
              }`}>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className={`font-semibold text-gray-800 ${task.is_done ? 'line-through text-gray-400' : ''}`}>
                      {task.title}
                    </h3>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Due: {task.due_date || 'No date'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleToggleDone(task)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                      task.is_done ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {task.is_done ? 'Completed' : 'Mark Done'}
                  </button>
                  <button onClick={() => handleDeleteTask(task.id)}
                    className="text-red-400 hover:text-red-600 text-sm font-semibold">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {deleteContactConfirm && (
          <ConfirmModal
            message="This will permanently delete the contact and all their tasks."
            onConfirm={confirmDeleteContact}
            onCancel={() => setDeleteContactConfirm(false)}
          />
        )}

        {deleteTaskConfirm && (
          <ConfirmModal
            message="This will permanently delete this task."
            onConfirm={confirmDeleteTask}
            onCancel={() => setDeleteTaskConfirm(null)}
          />
        )}
    </div>
  );
}