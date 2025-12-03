import React, { useContext, useEffect, useState, useCallback } from "react";
import BookCard from "../components/BookCard";
import DashboardCard from "../components/DashboardCard";
import { FiBook } from "react-icons/fi";
import { FiUsers } from "react-icons/fi";
import { FiTrendingUp } from "react-icons/fi";
import { FiClock } from "react-icons/fi";
import { FiSearch, FiX } from "react-icons/fi";
import Loader from "../components/common/Loader";
import SearchInput from "../components/common/SearchInput";
import AddEditBookModal from "../components/AddEditBookModal";
import useAuth from "../hooks/useAuth";
import { makeApiRequest } from "../lib/api";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booksLoading, setBooksLoading] = useState(true);

  const [showEditBookModal, setShowEditBookModal] = useState(false);
  const [toBeEditedBook, setToBeEditedBook] = useState(null);

  const [showAddBookModal, setshowAddBookModal] = useState(false);
  const [newBookInfo, setNewBookInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBooks = useCallback(async (query = "") => {
    setBooksLoading(true);

    // Build endpoint with query parameter if search query exists
    const endpoint = query.trim()
      ? `/books?q=${encodeURIComponent(query.trim())}`
      : "/books";

    const { response, error } = await makeApiRequest({
      endpoint,
    });
    if (error) {
      setBooksLoading(false);
      console.error(error);
      return;
    }

    // Backend returns array directly, not wrapped in data
    if (Array.isArray(response)) {
      setBooks(response);
    } else if (response?.data) {
      setBooks(response.data);
    }
    setBooksLoading(false);
  }, []);

  const getDashboardData = async () => {
    if (user?.role !== "LIBRARIAN") {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Calculate dashboard stats from available endpoints
    try {
      // Get all books
      const booksResponse = await makeApiRequest({
        endpoint: "/librarians/books",
      });

      // Get all users
      const usersResponse = await makeApiRequest({
        endpoint: "/librarians/users",
      });

      // Get all borrows
      const borrowsResponse = await makeApiRequest({
        endpoint: "/librarians/borrows",
      });

      if (booksResponse.error || usersResponse.error || borrowsResponse.error) {
        setLoading(false);
        return;
      }

      const books = Array.isArray(booksResponse.response)
        ? booksResponse.response
        : [];
      const users = Array.isArray(usersResponse.response)
        ? usersResponse.response
        : [];
      const borrows = Array.isArray(borrowsResponse.response)
        ? borrowsResponse.response
        : [];

      // Calculate stats
      const bookCount = books.length;
      const membersCount = users.filter((u) => u.role !== "LIBRARIAN").length;

      // Calculate issued books (borrows with status "BORROWED")
      const issuedBooksCount = borrows.filter(
        (borrow) => borrow.status === "BORROWED"
      ).length;

      // Calculate return due (borrows where dueDate < today and status = "BORROWED")
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

      const returnDueCount = borrows.filter((borrow) => {
        if (borrow.status !== "BORROWED") return false;
        if (!borrow.dueDate) return false;
        const dueDate = new Date(borrow.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
      }).length;

      setDashboardData({
        bookCount,
        membersCount,
        issuedBooksCount,
        returnDueCount,
      });
    } catch (error) {
      console.error("Dashboard data error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    if (user?.role === "LIBRARIAN") {
      getDashboardData();
    } else {
      setLoading(false);
    }
  }, [user, fetchBooks]);

  // Handle search query changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBooks(searchQuery);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchBooks]);

  // useEffect(() => {
  //   if (books.length > 0) {
  //     toast("Dashboard loaded successfully!!!!!");
  //   }
  // }, [books]);

  const handleBorrowBook = async (book) => {
    if (!book || !book.id) {
      return;
    }

    // Check if book is available
    if (book.availableCopies <= 0) {
      toast.error("This book is not available");
      return;
    }

    try {
      const { response, error } = await makeApiRequest({
        endpoint: "/borrow",
        method: "POST",
        body: { bookId: book.id },
        suppressToast: true, // Suppress automatic toast, we'll show custom message
      });

      if (error) {
        console.error("Borrow error:", error);
        toast.error(error || "Failed to borrow book. Please try again.");
        return;
      }

      if (response) {
        // Update the book list - decrement available copies
        const updatedBooks = books.map((b) => {
          if (b.id === book.id) {
            return {
              ...b,
              availableCopies: (b.availableCopies || 0) - 1,
            };
          }
          return b;
        });
        setBooks(updatedBooks);
        toast.success(`Successfully borrowed "${book.title}"`);
      }
    } catch (error) {
      console.error("Borrow error:", error);
    }
  };

  const handleReserveBook = async (book) => {
    if (!book?.id) {
      toast.error("Invalid book selected");
      return;
    }

    try {
      const { response, error } = await makeApiRequest({
        endpoint: "/reservations",
        method: "POST",
        body: { bookId: book.id },
        suppressToast: true, // Suppress automatic toast, we'll show custom message
      });

      if (error) {
        console.error("Reserve error:", error);
        toast.error(error || "Failed to reserve book. Please try again.");
        return;
      }

      if (response) {
        toast.success(
          `Successfully reserved "${book.title}". You will be notified when it becomes available.`
        );
      }
    } catch (error) {
      console.error("Reserve error:", error);
      toast.error("Failed to reserve book. Please try again.");
    }
  };

  const handleEditBookClick = (book) => {
    setToBeEditedBook(book);
    setShowEditBookModal(true);
  };
  const handleDeleteBook = async ({ id, onSuccess }) => {
    const { response, error } = await makeApiRequest({
      endpoint: `/books/${id}`,
      method: "DELETE",
    });

    if (error) {
      console.error(error);
      return;
    }

    onSuccess();

    // Backend returns 204 No Content on success
    if (response?.success !== false) {
      const updatedBooks = books.filter((book) => book?.id !== id);

      setBooks(updatedBooks);
      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          bookCount: dashboardData.bookCount - 1,
        });
      }
    }
  };

  const handleEditBookSubmit = async (bookInfo) => {
    // Backend doesn't have an update book endpoint
    // Books can only be added or removed
    // This would need to be implemented on backend
    console.log(
      "Edit book functionality not available - backend only supports add/remove"
    );
    setShowEditBookModal(false);
    setToBeEditedBook(null);
  };

  const handleAddBookSubmit = async (bookInfo) => {
    const { response, error } = await makeApiRequest({
      endpoint: "/books",
      method: "POST",
      body: bookInfo,
    });

    if (error) {
      console.error(error);
      return;
    }

    // Backend returns the created book directly
    if (response) {
      const newBook = response;

      setBooks([newBook, ...books]);

      setshowAddBookModal(false);
      setNewBookInfo(null);
      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          bookCount: dashboardData.bookCount + 1,
        });
      }
    }
  };

  return (
    <div className="px-4 py-6 min-h-screen bg-gray-50">
      <h1 className="pt-16 pb-4 text-3xl font-bold text-gray-800">
        Welcome, {user?.name?.split(" ")[0]}
      </h1>

      {user?.role === "LIBRARIAN" && (
        <>
          {loading ? (
            <div className="py-6">
              <Loader fullscreen={false} />
            </div>
          ) : (
            <div className="flex justify-start lg:justify-between mb-8 flex-wrap gap-4">
              <DashboardCard
                title="Books"
                count={dashboardData?.bookCount}
                Icon={<FiBook size={38} color="blue" />}
              />
              <DashboardCard
                title="Members"
                count={dashboardData?.membersCount}
                Icon={<FiUsers size={38} color="green" />}
              />
              <DashboardCard
                title="Issued Books"
                count={dashboardData?.issuedBooksCount}
                Icon={<FiTrendingUp size={38} color="orange" />}
              />
              <DashboardCard
                title={"Return Due"}
                count={dashboardData?.returnDueCount}
                Icon={<FiClock size={38} color="red" />}
              />
            </div>
          )}
        </>
      )}
      <div className="flex justify-between items-center mb-4">
        <h2 className=" text-2xl font-semibold">Books ({books.length})</h2>
        <div className="flex gap-2 items-center">
          {/* Search Bar */}
          <div className="relative flex items-center">
            <FiSearch
              className="absolute left-3 text-gray-400 z-10"
              size={18}
            />
            <SearchInput
              placeholder="Search books by title, author, or ISBN..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="pl-10 pr-10 !w-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-gray-400 hover:text-gray-600 z-10"
                title="Clear search"
              >
                <FiX size={18} />
              </button>
            )}
          </div>
          {user?.role !== "LIBRARIAN" && (
            <button
              onClick={() => fetchBooks(searchQuery)}
              className="bg-blue-500 hover:bg-blue-600 p-2 rounded-lg cursor-pointer text-white text-sm"
            >
              Refresh
            </button>
          )}
          {user?.role === "LIBRARIAN" && (
            <button
              onClick={() => setshowAddBookModal(true)}
              className="bg-green-500 hover:bg-green-500/90 p-2 rounded-lg cursor-pointer text-white"
            >
              Add Book
            </button>
          )}
        </div>
      </div>
      {booksLoading ? (
        <div className="py-6">
          <Loader fullscreen={false} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-6">
          {books.map((book) => {
            return (
              <BookCard
                key={book.id}
                book={book}
                handleBookClick={() => {
                  // For librarians, could show book details modal if needed
                  // For now, clicking does nothing - use Borrow button instead
                }}
                handleEditBookClick={handleEditBookClick}
                handleDeleteBook={handleDeleteBook}
                handleBorrowBook={handleBorrowBook}
                handleReserveBook={handleReserveBook}
              />
            );
          })}
        </div>
      )}

      <AddEditBookModal
        toBeEditedBook={toBeEditedBook}
        open={showEditBookModal}
        onClose={() => {
          setShowEditBookModal(false);
          setToBeEditedBook(null);
        }}
        onSubmit={handleEditBookSubmit}
        modalTitle={"Edit Book"}
      />
      <AddEditBookModal
        toBeEditedBook={newBookInfo}
        open={showAddBookModal}
        onClose={() => {
          setNewBookInfo(null);
          setshowAddBookModal(false);
        }}
        onSubmit={handleAddBookSubmit}
        modalTitle={"Add Book"}
      />
    </div>
  );
};

export default Dashboard;
