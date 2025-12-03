import React, { useState, useEffect } from "react";
import Modal from "./common/modal";
import Input from "./common/Input";

const EditUserModal = ({ open, user, onClose, onSave }) => {
  const [editedUserInfo, setEditedUserInfo] = useState({
    name: "",
    email: "",
    role: "STUDENT",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setEditedUserInfo({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "STUDENT",
        password: "", // Always start with empty password
      });
    }
  }, [user]);

  const handleSave = (e) => {
    e.preventDefault();
    onSave(editedUserInfo);
  };

  const handleClose = () => {
    setEditedUserInfo({
      name: "",
      email: "",
      role: "STUDENT",
      password: "",
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Edit User">
      <div className="p-2 bg-green-100 border border-green-300 rounded-lg mb-4">
        <h5 className="font-semibold">Editing: {user?.name || "User"}</h5>
      </div>

      <form className="space-y-4">
        <Input
          label="Name"
          value={editedUserInfo.name}
          onChange={(value) => {
            setEditedUserInfo({
              ...editedUserInfo,
              name: value,
            });
          }}
        />
        <Input
          label="Email"
          value={editedUserInfo.email}
          onChange={(value) => {
            setEditedUserInfo({
              ...editedUserInfo,
              email: value,
            });
          }}
        />
        <div className="flex flex-col gap-2">
          <label htmlFor="role" className="font-semibold">
            Role
          </label>
          <select
            id="role"
            value={editedUserInfo.role}
            className="border w-full p-2 rounded-lg"
            onChange={(event) => {
              setEditedUserInfo({
                ...editedUserInfo,
                role: event.target.value,
              });
            }}
          >
            <option value="STUDENT">Student</option>
            <option value="FACULTY">Faculty</option>
            <option value="LIBRARIAN">Librarian</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="font-semibold">
            New Password (Optional)
          </label>
          <input
            id="password"
            type="password"
            value={editedUserInfo.password}
            placeholder="Leave empty to keep current password"
            className="border w-full p-2 rounded-lg"
            onChange={(event) => {
              setEditedUserInfo({
                ...editedUserInfo,
                password: event.target.value,
              });
            }}
          />
          <p className="text-xs text-gray-500">
            Leave empty to keep the current password
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditUserModal;
