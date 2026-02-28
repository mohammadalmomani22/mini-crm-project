export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm z-50 border border-gray-200">
        <p className="text-gray-800 font-semibold text-lg mb-2">Are you sure?</p>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}