import React, { useState, useEffect } from "react";
import Card from "../components/common/Card";
import useAuth from "../hooks/useAuth";
import { FiCheck, FiEdit, FiX, FiClock, FiXCircle } from "react-icons/fi";
import Input from "../components/common/Input";
import { makeApiRequest } from "../lib/api";

const Profile = () => {
  const { user, setUser } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [editedUserInfo, setEditedUserInfo] = useState({});
  const [passwordInfo, setPasswordInfo] = useState({});
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(false);

  const handleUpdateUser = async () => {
    if (!editedUserInfo.name && !editedUserInfo.email) {
      setEditMode(false);
      setEditedUserInfo(null);
      return;
    }

    const { response, error } = await makeApiRequest({
      endpoint: "/users/profile",
      method: "PUT",
      body: {
        name: editedUserInfo.name,
        email: editedUserInfo.email,
      },
    });

    if (error) {
      console.error("Update error:", error);
      return;
    }

    if (response) {
      setUser(response);
      setEditMode(false);
      setEditedUserInfo(null);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordInfo?.oldPassword || !passwordInfo?.newPassword) {
      return;
    }

    const { response, error } = await makeApiRequest({
      endpoint: "/users/profile/password",
      method: "PATCH",
      body: {
        oldPassword: passwordInfo.oldPassword,
        newPassword: passwordInfo.newPassword,
      },
    });

    if (error) {
      console.error("Password change error:", error);
      return;
    }

    if (response) {
      setChangePasswordMode(false);
      setPasswordInfo(null);
    }
  };

  const fetchReservations = async () => {
    setLoadingReservations(true);
    const { response, error } = await makeApiRequest({
      endpoint: "/reservations",
    });

    if (!error && response) {
      setReservations(Array.isArray(response) ? response : []);
    }
    setLoadingReservations(false);
  };

  useEffect(() => {
    if (user) {
      fetchReservations();
    }
  }, [user]);

  const handleCancelReservation = async (reservationId) => {
    const { error } = await makeApiRequest({
      endpoint: `/reservations/${reservationId}`,
      method: "DELETE",
    });

    if (!error) {
      fetchReservations();
    }
  };

  return (
    <div>
      <div className="p-4 px-8 pt-20 lg:pt-4  mb-8 shadow">
        <h4 className="text-3xl font-semibold">Profile</h4>
      </div>
      <div className="px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card customClass="space-y-4 bg-white shadow">
          <div className="flex justify-between items-center border-b pb-1">
            <h6 className="text-lg font-semibold">User Details</h6>
            <button
              onClick={() => {
                setEditMode(true);
                setEditedUserInfo(user);
                setChangePasswordMode(false);
                setPasswordInfo({});
              }}
              className="hover:bg-green-100 rounded-lg p-2 text-green-600 cursor-pointer"
            >
              <FiEdit size={20} />
            </button>
          </div>

          <div className="space-y-1">
            <p className="font-bold">Name</p>
            <p>{user?.name || "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="font-bold">Email</p>
            <p>{user?.email || "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="font-bold">Role</p>
            <p>{user?.role || "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="font-bold">Max Borrow Limit</p>
            <p>{user?.maxBorrowLimit || "-"}</p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                setChangePasswordMode(true);
                setEditMode(false);
                setEditedUserInfo({});
              }}
              className="p-2 bg-red-400 hover:bg-red-400/90 rounded-lg text-white cursor-pointer"
            >
              Change Password
            </button>
          </div>
        </Card>
        {editMode && (
          <Card customClass="space-y-4 bg-white shadow">
            <div className="flex justify-between items-center border-b pb-1">
              <h6 className="text-lg font-semibold">Edit Your Details</h6>
              <div className="flex gap-8">
                <button
                  onClick={handleUpdateUser}
                  className="hover:bg-green-100 rounded-lg p-2 text-green-600 cursor-pointer"
                >
                  <FiCheck size={20} />
                </button>
                <button
                  onClick={() => {
                    setEditMode(!editMode);
                    setEditedUserInfo(null);
                  }}
                  className="hover:bg-red-100 rounded-lg p-2 text-red-600 cursor-pointer"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <Input
              label={"Name"}
              value={editedUserInfo.name}
              onChange={(value) => {
                setEditedUserInfo({
                  ...editedUserInfo,
                  name: value,
                });
              }}
            />
            <Input
              label={"Email"}
              value={editedUserInfo.email}
              onChange={(value) => {
                setEditedUserInfo({
                  ...editedUserInfo,
                  email: value,
                });
              }}
            />
            <p className="text-sm text-gray-500 mt-4">
              Note: You cannot change your role or borrow limit. Contact a
              librarian for these changes.
            </p>
          </Card>
        )}
        {changePasswordMode && (
          <Card customClass="space-y-4 bg-white shadow">
            <div className="flex justify-between items-center border-b pb-1">
              <h6 className="text-lg font-semibold">Edit Your Password</h6>
              <div className="flex gap-8">
                <button
                  onClick={handleChangePassword}
                  className="hover:bg-green-100 rounded-lg p-2 text-green-600 cursor-pointer"
                >
                  <FiCheck size={20} />
                </button>
                <button
                  onClick={() => {
                    setPasswordInfo(null);
                    setChangePasswordMode(false);
                  }}
                  className="hover:bg-red-100 rounded-lg p-2 text-red-600 cursor-pointer"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <Input
              label={"Old Password"}
              value={passwordInfo?.oldPassword}
              onChange={(value) => {
                setPasswordInfo({
                  ...passwordInfo,
                  oldPassword: value,
                });
              }}
              type="password"
            />
            <Input
              label={"New Password"}
              value={passwordInfo?.newPassword}
              onChange={(value) => {
                setPasswordInfo({
                  ...passwordInfo,
                  newPassword: value,
                });
              }}
              type="password"
            />
          </Card>
        )}
        <Card customClass="space-y-4 bg-white shadow">
          <div className="flex justify-between items-center border-b pb-1">
            <h6 className="text-lg font-semibold">My Reservations</h6>
            <button
              onClick={fetchReservations}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Refresh
            </button>
          </div>

          {loadingReservations ? (
            <div className="text-center py-4 text-gray-500">Loading...</div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No active reservations
            </div>
          ) : (
            <div className="space-y-3">
              {reservations
                .filter((r) => r.status === "PENDING")
                .map((reservation) => (
                  <div
                    key={reservation.id}
                    className="p-3 border border-gray-200 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {reservation.book?.title || "Unknown Book"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {reservation.book?.author || "Unknown Author"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Reserved on:{" "}
                        {new Date(reservation.createdAt).toLocaleDateString()}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                        {reservation.status}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCancelReservation(reservation.id)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Cancel Reservation"
                    >
                      <FiXCircle size={18} />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Profile;
