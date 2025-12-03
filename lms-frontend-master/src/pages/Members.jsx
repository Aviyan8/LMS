import { useContext, useMemo, useState } from "react";
import Table from "../components/common/Table";
import Card from "../components/common/Card";
import EditUserModal from "../components/EditUserModal";
import DeleteUserModal from "../components/DeleteUserModal";
import { MembersContext } from "../context/MembersContext";
import useAuth from "../hooks/useAuth";
import { FiAlertTriangle, FiEdit2, FiTrash } from "react-icons/fi";
import { makeApiRequest } from "../lib/api";

const getMemberColumns = ({ onEdit, onDelete, currentUserId }) => {
  return [
    {
      label: "Name",
      key: "name",
    },
    {
      label: "Email",
      key: "email",
    },
    {
      label: "Borrow Limit",
      key: "maxBorrowLimit",
    },
    {
      label: "Role",
      key: "role",
      renderDetail: (row) => {
        return <span>{row?.role || "-"}</span>;
      },
    },
    {
      label: "Actions",
      key: "actions",
      renderDetail: (row) => {
        // Don't show actions for the current user (can't edit/delete yourself)
        if (row?.id === currentUserId) {
          return <span className="text-gray-400 text-sm">-</span>;
        }
        return (
          <div className="flex gap-3 items-center">
            <div
              onClick={() => onEdit(row)}
              className="hover:bg-green-100 p-1 rounded-lg text-green-500 cursor-pointer"
              title="Edit User"
            >
              <FiEdit2 size={16} />
            </div>
            <div
              onClick={() => onDelete(row)}
              className="hover:bg-red-100 p-1 rounded-lg text-red-500 cursor-pointer"
              title="Delete User"
            >
              <FiTrash size={16} />
            </div>
          </div>
        );
      },
    },
  ];
};

const Members = () => {
  const { members, setMembers } = useContext(MembersContext);
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleEdit = (userToEdit) => {
    setSelectedUser(userToEdit);
    setShowEditModal(true);
  };

  const handleDelete = (userToDelete) => {
    setSelectedUser(userToDelete);
    setShowDeleteModal(true);
  };

  const handleUpdateUser = async (editedUserInfo) => {
    if (!selectedUser) return;

    try {
      // Update user details (name, email, password if provided)
      const updateData = {
        name: editedUserInfo.name,
        email: editedUserInfo.email,
      };

      if (editedUserInfo.password) {
        updateData.password = editedUserInfo.password;
      }

      const { response: updatedUser, error: updateError } =
        await makeApiRequest({
          endpoint: `/librarians/users/${selectedUser.id}`,
          method: "PUT",
          body: updateData,
        });

      if (updateError) {
        console.error(updateError);
        return;
      }

      // If role changed, update role separately
      if (editedUserInfo.role !== selectedUser.role) {
        const { response: roleUpdatedUser, error: roleError } =
          await makeApiRequest({
            endpoint: `/librarians/users/${selectedUser.id}/role`,
            method: "PATCH",
            body: { role: editedUserInfo.role },
          });

        if (roleError) {
          console.error(roleError);
          return;
        }

        // Update members list with role-updated user
        const updatedMembers = members.map((member) => {
          if (member?.id === selectedUser.id) {
            return roleUpdatedUser;
          }
          return member;
        });
        setMembers(updatedMembers);
      } else {
        // Update members list with updated user
        const updatedMembers = members.map((member) => {
          if (member?.id === selectedUser.id) {
            return updatedUser;
          }
          return member;
        });
        setMembers(updatedMembers);
      }

      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await makeApiRequest({
        endpoint: `/librarians/users/${selectedUser.id}`,
        method: "DELETE",
      });

      if (error) {
        console.error(error);
        return;
      }

      // Remove user from members list
      const updatedMembers = members.filter(
        (member) => member?.id !== selectedUser.id
      );
      setMembers(updatedMembers);

      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  const columns = useMemo(
    () =>
      getMemberColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        currentUserId: user?.id,
      }),
    [user, members]
  );

  if (user?.role !== "LIBRARIAN") {
    return (
      <div className="h-screen bg-red-50 flex flex-col gap-8 items-center justify-center  text-red-600">
        <FiAlertTriangle size={50} />
        <h3 className="text-xl">You are not authorized to access this page!</h3>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 px-8 pt-20 lg:pt-4 mb-8 shadow">
        <h4 className="text-3xl font-semibold">Members</h4>
      </div>
      <div className="px-8">
        <Card customClass="bg-white border border-gray-300">
          <h5 className="text-2xl mb-4 font-bold">Library Users</h5>
          <Table columns={columns} data={members} />
        </Card>
      </div>

      <EditUserModal
        open={showEditModal}
        user={selectedUser}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSave={handleUpdateUser}
      />

      <DeleteUserModal
        open={showDeleteModal}
        user={selectedUser}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default Members;
