import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router";
import { toast } from "react-toastify";
import Table from "../components/common/Table";
import Card from "../components/common/Card";
import { makeApiRequest } from "../lib/api";
import useAuth from "../hooks/useAuth";

const getTransactionsColumn = ({
  returnBook,
  handlePayFees,
  showUserInfo = false,
  currentUserId = null,
}) => {
  const columns = [
    {
      label: "Book",
      key: "book",
      renderDetail: (row) => {
        return (
          row?.book?.title || (
            <span className="font-semibold text-red-400">
              Book has been removed
            </span>
          )
        );
      },
    },
    {
      label: "Author",
      key: "book",
      renderDetail: (row) => {
        return row?.book?.author || "-";
      },
    },
  ];

  // Add User column when viewing all history
  if (showUserInfo) {
    columns.push({
      label: "User",
      key: "user",
      renderDetail: (row) => {
        return (
          <div>
            <p className="font-medium">{row?.user?.name || "-"}</p>
            <p className="text-xs text-gray-500">{row?.user?.email || ""}</p>
            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
              {row?.user?.role || ""}
            </span>
          </div>
        );
      },
    });
  }

  columns.push(
    {
      label: "Borrow Date",
      key: "borrowDate",
      renderDetail: (row) => {
        const date = row.borrowDate;
        return date ? new Date(date).toDateString() : "-";
      },
    },
    {
      label: "Due Date",
      key: "dueDate",
      renderDetail: (row) => {
        const date = row.dueDate;
        if (!date) return "-";

        const dueDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);

        const daysUntilDue = Math.ceil(
          (dueDate - today) / (1000 * 60 * 60 * 24)
        );
        const isOverdue = daysUntilDue < 0 && row?.status === "BORROWED";
        const isDueSoon =
          daysUntilDue >= 0 && daysUntilDue <= 3 && row?.status === "BORROWED";

        return (
          <div>
            <p
              className={
                isOverdue
                  ? "text-red-600 font-semibold"
                  : isDueSoon
                  ? "text-orange-600 font-medium"
                  : ""
              }
            >
              {dueDate.toDateString()}
            </p>
            {isOverdue && (
              <p className="text-xs text-red-500 font-medium">Overdue</p>
            )}
            {isDueSoon && !isOverdue && (
              <p className="text-xs text-orange-500">Due soon</p>
            )}
          </div>
        );
      },
    },
    {
      label: "Status",
      key: "status",
      renderDetail: (row) => {
        return row?.status || "-";
      },
    },
    {
      label: "Return Date",
      key: "returnDate",
      renderDetail: (row) => {
        const date = row.returnDate;
        return date ? new Date(date).toDateString() : "-";
      },
    },
    {
      label: "Fees",
      key: "fees",
      renderDetail: (row) => {
        // Only show fees if book is returned
        if (row?.status !== "RETURNED" || !row?.fees) {
          return "-";
        }
        const fees = row.fees;
        const hasFees = fees.totalFee > 0;

        if (!hasFees) {
          return <span className="text-green-600 font-medium">$0</span>;
        }

        return (
          <div className="text-sm">
            <p className="font-semibold text-red-600">
              ${fees.totalFee.toFixed(2)}
            </p>
            {fees.lateFee > 0 && (
              <p className="text-xs text-red-500">
                Late: ${fees.lateFee.toFixed(2)}
              </p>
            )}
            {fees.reservationFee > 0 && (
              <p className="text-xs text-orange-500">
                Reservation: ${fees.reservationFee.toFixed(2)}
              </p>
            )}
          </div>
        );
      },
    },
    {
      label: "Payment Status",
      key: "paymentStatus",
      renderDetail: (row) => {
        // Only show payment status if book is returned and has fees
        if (
          row?.status !== "RETURNED" ||
          !row?.fees ||
          row?.fees?.totalFee === 0
        ) {
          return "-";
        }

        const paymentStatus = row?.paymentStatus || "PENDING";

        if (paymentStatus === "PAID") {
          return (
            <div className="text-sm">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                Paid
              </span>
              {row?.paidAt && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(row.paidAt).toLocaleDateString()}
                </p>
              )}
            </div>
          );
        }

        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
            Pending
          </span>
        );
      },
    },
    {
      label: "Actions",
      key: "actions",
      renderDetail: (row) => {
        // Only show if transaction belongs to current user
        const isOwnTransaction = showUserInfo
          ? row?.user?.id === currentUserId
          : true;
        // Return button for borrowed books
        if (row?.status === "BORROWED" && isOwnTransaction) {
          return (
            <button
              className="px-3 py-2 bg-green-300 hover:bg-green-300/90 rounded-lg cursor-pointer"
              onClick={() => returnBook(row?.book?.id)}
            >
              Return
            </button>
          );
        } else if (
          row?.status === "RETURNED" &&
          row?.fees?.totalFee > 0 &&
          row?.paymentStatus !== "PAID" &&
          handlePayFees &&
          isOwnTransaction
        ) {
          return (
            <button
              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer"
              onClick={() => handlePayFees(row?.id)}
            >
              Pay Fees
            </button>
          );
        }

        // Show payment status for paid fees
        else if (
          row?.status === "RETURNED" &&
          row?.fees?.totalFee > 0 &&
          row?.paymentStatus === "PAID"
        ) {
          return (
            <span className="text-green-600 font-medium text-sm">Paid</span>
          );
        }

        return "-";
      },
    }
  );

  return columns;
};

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  // Default to "all" for librarians, "my" for regular users
  const [viewMode, setViewMode] = useState("my");
  const [searchParams, setSearchParams] = useSearchParams();
  const verificationInProgress = useRef(false);

  // Set default view mode based on user role
  useEffect(() => {
    if (user?.role === "LIBRARIAN") {
      setViewMode("all");
    } else {
      setViewMode("my");
    }
  }, [user]);

  const fetchTransactions = useCallback(async () => {
    try {
      let endpoint = "/borrow";

      // Librarians can toggle between their own borrows and all borrows
      if (user?.role === "LIBRARIAN" && viewMode === "all") {
        endpoint = "/librarians/borrows";
      }

      const { response, error } = await makeApiRequest({
        endpoint,
        method: "GET",
      });

      if (error) {
        console.error(error);
        return;
      }

      // Backend returns array directly
      if (Array.isArray(response)) {
        console.log("Fetched transactions:", response.length, "items");
        // Log payment statuses for debugging
        response.forEach((t) => {
          if (t.fees?.totalFee > 0) {
            console.log(
              `Transaction ${t.id}: paymentStatus = ${t.paymentStatus}, fees = $${t.fees.totalFee}`
            );
          }
        });
        setTransactions(response);
      } else if (response?.data) {
        setTransactions(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  }, [user, viewMode]);

  const returnBook = async (bookId) => {
    const { error, response } = await makeApiRequest({
      endpoint: `/borrow/return`,
      method: "POST",
      body: { bookId },
    });

    if (error) {
      return;
    }

    if (response) {
      // Refresh transactions after return
      fetchTransactions();
    }
  };

  const handlePayFees = async (transactionId) => {
    try {
      // First, refresh transactions to get latest status
      await fetchTransactions();

      // Check if already paid (in case status changed)
      const currentTransaction = transactions.find(
        (t) => t.id === transactionId
      );
      if (currentTransaction?.paymentStatus === "PAID") {
        toast.info("Fees have already been paid for this transaction.");
        return;
      }

      const { response, error } = await makeApiRequest({
        endpoint: "/payments/create-intent",
        method: "POST",
        body: { transactionId },
      });

      if (error) {
        // Check if it's the "already paid" error
        if (
          error.message?.includes("already paid") ||
          error.error?.includes("already paid")
        ) {
          toast.info(
            "Fees have already been paid for this transaction. Refreshing..."
          );
          // Refresh to get updated status
          await fetchTransactions();
        } else {
          console.error("Payment error:", error);
          toast.error(
            error.message || error.error || "Failed to create payment"
          );
        }
        return;
      }

      if (response?.url) {
        // Redirect to Stripe Checkout
        window.location.href = response.url;
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("An error occurred while processing payment");
    }
  };

  // Handle payment success/cancel redirects
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    // Prevent duplicate verification
    if (
      paymentStatus === "success" &&
      sessionId &&
      !verificationInProgress.current
    ) {
      verificationInProgress.current = true;

      // Verify payment
      const verifyPayment = async () => {
        try {
          const { response, error } = await makeApiRequest({
            endpoint: `/payments/verify?sessionId=${encodeURIComponent(
              sessionId
            )}`,
            method: "GET",
          });

          if (error) {
            console.error("Payment verification error:", error);
            verificationInProgress.current = false;
            return;
          }

          if (response?.paid) {
            console.log("Payment verified successfully");
            toast.success("Payment successful! Fees have been paid.");

            // Remove query params first to prevent re-triggering
            setSearchParams({});

            // Refresh transactions to show updated payment status
            await fetchTransactions();

            // Small delay to ensure UI updates (in case of caching)
            setTimeout(() => {
              fetchTransactions();
              verificationInProgress.current = false;
            }, 1000);
          } else {
            console.log(
              "Payment not yet processed, will be updated via webhook"
            );
            // Remove query params
            setSearchParams({});
            // Still refresh to check if webhook updated it
            await fetchTransactions();
            // Try again after a short delay
            setTimeout(() => {
              fetchTransactions();
              verificationInProgress.current = false;
            }, 2000);
          }
        } catch (error) {
          console.error("Payment verification failed:", error);
          // Still refresh transactions in case webhook updated it
          setSearchParams({});
          fetchTransactions();
          verificationInProgress.current = false;
        }
      };

      verifyPayment();
    } else if (paymentStatus === "cancelled") {
      // Remove query params
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, fetchTransactions]);

  const columns = getTransactionsColumn({
    returnBook,
    handlePayFees,
    showUserInfo: user?.role === "LIBRARIAN" && viewMode === "all",
    currentUserId: user?.id,
  });

  useEffect(() => {
    fetchTransactions();
  }, [viewMode, user]);

  // Also refresh when component mounts to catch any webhook updates
  useEffect(() => {
    // Check if we just came back from payment
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      // Small delay to ensure webhook has processed
      setTimeout(() => {
        fetchTransactions();
      }, 1000);
    }
  }, []);

  const handleViewModeToggle = () => {
    setViewMode(viewMode === "my" ? "all" : "my");
  };

  return (
    <>
      <div className="p-4 px-8 pt-20 lg:pt-4 mb-8 shadow">
        <h4 className="text-3xl font-semibold">Transactions</h4>
      </div>
      <div className="px-8">
        <Card customClass="bg-white border border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-2xl font-bold">Transaction History</h5>
            {user?.role === "LIBRARIAN" && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  {viewMode === "my" ? "My History" : "All History"}
                </span>
                <button
                  onClick={handleViewModeToggle}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    viewMode === "my"
                      ? "bg-blue-500 text-white hover:bg-blue-600 shadow-sm"
                      : "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                >
                  {viewMode === "my" ? "View All" : "View Mine"}
                </button>
              </div>
            )}
          </div>
          <Table columns={columns} data={transactions} />
        </Card>
      </div>
    </>
  );
};

export default Transactions;
