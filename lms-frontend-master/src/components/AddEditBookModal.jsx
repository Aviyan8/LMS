import React, { useState, useEffect } from "react";
import Modal from "./common/modal";

const AddEditBookModal = ({
  open,
  toBeEditedBook,
  onClose,
  onSubmit,
  modalTitle,
}) => {
  const [bookInfo, setBookInfo] = useState(
    toBeEditedBook || { totalCopies: 1, availableCopies: 1 }
  );

  useEffect(() => {
    // When editing, use the book data; when adding, use defaults
    if (toBeEditedBook) {
    setBookInfo(toBeEditedBook);
    } else {
      setBookInfo({ totalCopies: 1, availableCopies: 1 });
    }
  }, [toBeEditedBook, open]);

  return (
    <Modal open={open} onClose={onClose} title={modalTitle}>
      <div className="p-2 bg-green-100 border border-green-300 rounded-lg">
        <h5 className="font-semibold">
          {toBeEditedBook?.title || "You are adding a New Book!"}
        </h5>
      </div>

      <form className="mt-4 space-y-4">
        <h5 className="font-semibold">Enter Information of Book</h5>
        <div className="flex flex-col gap-2">
          <label htmlFor="bookTitle">Book Title</label>
          <input
            value={bookInfo?.title}
            id="bookTitle"
            placeholder="Enter your book Title."
            className="border w-full p-2 rounded-lg"
            onChange={(event) => {
              setBookInfo({
                ...bookInfo,
                title: event.target.value,
              });
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="bookAuthor">Book Author</label>
          <input
            value={bookInfo?.author}
            id="bookAuthor"
            placeholder="Enter author name of book."
            className="border w-full p-2 rounded-lg"
            onChange={(event) => {
              setBookInfo({
                ...bookInfo,
                author: event.target.value,
              });
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="bookISBN">Book ISBN</label>
          <input
            value={bookInfo?.isbn}
            id="bookISBN"
            placeholder="Enter ISBN of book."
            className="border w-full p-2 rounded-lg"
            onChange={(event) => {
              setBookInfo({
                ...bookInfo,
                isbn: event.target.value,
              });
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="totalCopies">Total Copies</label>
          <input
            type="number"
            min="1"
            value={bookInfo?.totalCopies || 1}
            id="totalCopies"
            placeholder="Enter total number of copies (default: 1)"
            className="border w-full p-2 rounded-lg"
            onChange={(event) => {
              const totalCopies = parseInt(event.target.value) || 1;
              setBookInfo({
                ...bookInfo,
                totalCopies: totalCopies,
                // If availableCopies is not set or is greater than new total, set it to totalCopies
                availableCopies: totalCopies
              });
            }}
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={(e) => {
              e.preventDefault();
              onSubmit(bookInfo);
            }}
            className="px-3 py-2 bg-green-300 hover:bg-green-300/90 rounded-lg cursor-pointer"
          >
            Submit
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditBookModal;
