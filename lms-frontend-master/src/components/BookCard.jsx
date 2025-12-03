import React, { useState } from "react";
import Card from "./common/Card";
import Tooltip from "./common/Tooltip";
import { FiEdit2, FiTrash, FiBook, FiClock } from "react-icons/fi";
import useAuth from "../hooks/useAuth";
import Modal from "./common/modal";

const BookCard = ({
  book,
  handleBookClick,
  handleEditBookClick,
  handleDeleteBook,
  handleBorrowBook,
  handleReserveBook,
}) => {
  const { user } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toBeDeletedBook, setToBeDeletedBook] = useState(null);

  const isAvailable = book?.availableCopies > 0;
  const hasReservations = book?.hasReservations || false;

  return (
    <>
      <Card
        onClick={handleBookClick}
        customClass="w-full !px-6 !py-5 bg-white border border-gray-200 !rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        {/* Header with Title and Availability Badge */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h4 className="text-lg font-bold text-gray-900 leading-tight flex-1 line-clamp-2">
              {book?.title}
            </h4>
            <div
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
                isAvailable
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}
            >
              {isAvailable ? "Available" : "Unavailable"}
            </div>
          </div>
        </div>

        {/* Author */}
        <div className="mb-3">
          <p className="text-sm text-gray-600 font-medium">
            {book?.author || "Unknown Author"}
          </p>
        </div>

        {/* ISBN */}
        <div className="mb-4">
          <p className="text-xs text-gray-500">
            <span className="font-medium">ISBN:</span> {book?.isbn}
          </p>
        </div>

        {/* Footer with Copies and Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* Copies Info */}
          <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs font-semibold text-gray-700">
              <span className="text-gray-900">
                {book?.availableCopies || 0}
              </span>
              <span className="text-gray-500">/{book?.totalCopies || 0}</span>{" "}
              <span className="text-gray-500">copies</span>
            </p>
          </div>

          {/* Action Icons */}
          <div className="flex gap-2 items-center">
            {/* Borrow button - shown when book is available */}
            {isAvailable && handleBorrowBook && (
              <Tooltip text="Borrow Book" position="top">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBorrowBook(book);
                  }}
                  className="hover:bg-blue-50 p-2 rounded-lg text-blue-600 cursor-pointer transition-colors duration-150"
                >
                  <FiBook size={18} />
                </button>
              </Tooltip>
            )}

            {/* Reserve button - shown when:
                1. Book is unavailable, OR
                2. Book is available but has active reservations */}
            {handleReserveBook &&
              (!isAvailable || (isAvailable && hasReservations)) && (
                <Tooltip text="Reserve Book" position="top">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReserveBook(book);
                    }}
                    className="hover:bg-orange-50 p-2 rounded-lg text-orange-600 cursor-pointer transition-colors duration-150"
                  >
                    <FiClock size={18} />
                  </button>
                </Tooltip>
              )}

            {/* Librarian management actions */}
            {user?.role === "LIBRARIAN" && (
              <>
                <Tooltip text="Edit Book" position="top">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditBookClick(book);
                    }}
                    className="hover:bg-green-50 p-2 rounded-lg text-green-600 cursor-pointer transition-colors duration-150"
                  >
                    <FiEdit2 size={18} />
                  </button>
                </Tooltip>
                <Tooltip text="Delete Book" position="top">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteModal(true);
                      setToBeDeletedBook(book);
                    }}
                    className="hover:bg-red-50 p-2 rounded-lg text-red-600 cursor-pointer transition-colors duration-150"
                  >
                    <FiTrash size={18} />
                  </button>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      </Card>
      <Modal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
        }}
        title="Delete Book"
      >
        <div className="p-4 rounded-lg bg-red-50">
          <h4 className="font-semibold text-red-500">
            Are you Sure you want to delete?
          </h4>
          <p className="text-sm text-red-500 mt-4">
            This will delete{" "}
            <span className="font-semibold">{toBeDeletedBook?.title}</span>?
            This action is irreversible!
          </p>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => {
              handleDeleteBook({
                id: toBeDeletedBook?.id,
                onSuccess: () => {
                  setToBeDeletedBook(null);
                  setShowDeleteModal(false);
                },
              });
            }}
            className="p-2 bg-red-500 text-white hover:bg-red-400 rounded-lg cursor-pointer"
          >
            Yes
          </button>
        </div>
      </Modal>
    </>
  );
};

export default BookCard;
