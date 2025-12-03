import React from "react";
import Modal from "./common/modal";

const DeleteUserModal = ({ open, user, onClose, onConfirm }) => {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal open={open} onClose={onClose} title="Delete User">
      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
        <h4 className="font-semibold text-red-600 mb-2">
          Are you sure you want to delete this user?
        </h4>
        <p className="text-sm text-red-600 mt-2">
          This will permanently delete{" "}
          <span className="font-semibold">{user?.name}</span> ({user?.email})
          from the system.
        </p>
        <p className="text-sm text-red-500 mt-2 font-medium">
          This action cannot be undone!
        </p>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg cursor-pointer"
        >
          Yes, Delete
        </button>
      </div>
    </Modal>
  );
};

export default DeleteUserModal;
