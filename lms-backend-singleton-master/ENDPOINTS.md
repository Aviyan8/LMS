# Library Management System - API Endpoints Documentation

**Base URL:** `http://localhost:3004/api`

**Authentication:** Most endpoints require authentication. The system uses cookie-based authentication with HttpOnly cookies. For API clients that cannot use cookies, JWT tokens can be provided in the Authorization header as a fallback:

```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new user account in the system.

**Authentication:** Not required

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "STUDENT"
}
```

**Role Options:** `STUDENT`, `FACULTY`

**Note:** LIBRARIAN registration is not permitted through this endpoint. Only existing librarians can create librarian accounts through the librarian user management endpoints.

**Response:** `201 Created`

```json
{
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Missing required fields or invalid role
- `403 Forbidden` - Cannot register as LIBRARIAN
- `409 Conflict` - User with email already exists

---

### Login

**POST** `/auth/login`

Authenticate user credentials and establish authenticated session.

**Authentication:** Not required

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`

```json
{
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT"
  }
}
```

**Note:** Authentication token is set as HttpOnly cookie automatically. No token is returned in response body.

**Error Responses:**

- `400 Bad Request` - Missing email or password
- `401 Unauthorized` - Invalid email or password

---

### Logout

**POST** `/auth/logout`

Terminate the current authenticated session.

**Authentication:** Required

**Response:** `200 OK`

```json
{
  "message": "Logged out successfully"
}
```

---

## Book Endpoints

### Search Books

**GET** `/books`

Search for books by title, author, or ISBN. Returns all books if no query parameter is provided.

**Authentication:** Not required

**Query Parameters:**

- `q` (optional) - Search query string

**Example:** `GET /books?q=javascript`

**Response:** `200 OK`

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "JavaScript: The Good Parts",
    "author": "Douglas Crockford",
    "isbn": "978-0596517748",
    "totalCopies": 5,
    "availableCopies": 3
  },
  {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "title": "Eloquent JavaScript",
    "author": "Marijn Haverbeke",
    "isbn": "978-1593279509",
    "totalCopies": 3,
    "availableCopies": 1
  }
]
```

---

### Get Book by ID

**GET** `/books/:id`

Retrieve detailed information about a specific book.

**Authentication:** Not required

**URL Parameters:**

- `id` - Book ID (UUID)

**Example:** `GET /books/a1b2c3d4-e5f6-7890-abcd-ef1234567890`

**Response:** `200 OK`

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "JavaScript: The Good Parts",
  "author": "Douglas Crockford",
  "isbn": "978-0596517748",
  "totalCopies": 5,
  "availableCopies": 3
}
```

**Error Responses:**

- `404 Not Found` - Book not found

---

### Add Book

**POST** `/books`

Add a new book to the library catalogue.

**Authentication:** Required (Librarian only)

**Request Body:**

```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "978-0132350884",
  "totalCopies": 10,
  "availableCopies": 10
}
```

**Note:** `totalCopies` and `availableCopies` are optional fields (default: 1)

**Response:** `201 Created`

```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "978-0132350884",
  "totalCopies": 10,
  "availableCopies": 10
}
```

**Error Responses:**

- `400 Bad Request` - Missing required fields (title, author, ISBN)
- `401 Unauthorized` - Not authenticated or not a librarian
- `409 Conflict` - Book with ISBN already exists

---

### Update Book

**PUT** `/books/:id`

Update book information in the catalogue.

**Authentication:** Required (Librarian only)

**URL Parameters:**

- `id` - Book ID (UUID)

**Request Body:**

```json
{
  "title": "Updated Title",
  "author": "Updated Author",
  "isbn": "978-0132350884",
  "totalCopies": 15,
  "availableCopies": 12
}
```

**Response:** `200 OK`

```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "title": "Updated Title",
  "author": "Updated Author",
  "isbn": "978-0132350884",
  "totalCopies": 15,
  "availableCopies": 12
}
```

**Error Responses:**

- `400 Bad Request` - Invalid data
- `401 Unauthorized` - Not authenticated or not a librarian
- `404 Not Found` - Book not found

---

### Remove Book

**DELETE** `/books/:id`

Remove a book from the library catalogue.

**Authentication:** Required (Librarian only)

**URL Parameters:**

- `id` - Book ID (UUID)

**Example:** `DELETE /books/a1b2c3d4-e5f6-7890-abcd-ef1234567890`

**Response:** `204 No Content`

**Error Responses:**

- `401 Unauthorized` - Not authenticated or not a librarian
- `404 Not Found` - Book not found

---

## Borrow Endpoints

### Borrow Book

**POST** `/borrow`

Borrow a book from the library.

**Authentication:** Required

**Request Body:**

```json
{
  "bookId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Response:** `201 Created`

```json
{
  "id": "d4e5f6a7-b8c9-0123-def4-567890123456",
  "book": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "JavaScript: The Good Parts",
    "author": "Douglas Crockford"
  },
  "borrowDate": "2024-01-15T10:30:00.000Z",
  "dueDate": "2024-01-29T10:30:00.000Z"
}
```

**Error Responses:**

- `400 Bad Request` - Missing bookId, book not available, or borrow limit reached
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Book or user not found

**Business Rules:**

- Borrowing period: 14 days from borrow date
- Borrow limits:
  - Students: 3 books maximum
  - Faculty: 5 books maximum
  - Librarians: 10 books maximum

---

### Return Book

**POST** `/borrow/return`

Return a borrowed book to the library.

**Authentication:** Required

**Request Body:**

```json
{
  "bookId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Response:** `200 OK`

```json
{
  "id": "d4e5f6a7-b8c9-0123-def4-567890123456",
  "returnDate": "2024-01-20T14:30:00.000Z",
  "fees": {
    "baseFee": 0,
    "lateFee": 0,
    "reservationFee": 0,
    "totalFee": 0
  }
}
```

**Example Response (with late fee):**

```json
{
  "id": "d4e5f6a7-b8c9-0123-def4-567890123456",
  "returnDate": "2024-02-05T14:30:00.000Z",
  "fees": {
    "baseFee": 0,
    "lateFee": 5,
    "reservationFee": 0,
    "totalFee": 5
  }
}
```

**Error Responses:**

- `400 Bad Request` - Missing bookId or book already returned
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Borrow transaction not found

**Fee Calculation:**

- Base fee: $0 (configurable)
- Late fee: $5 per overdue return
- Reservation fee: $2 if book has pending reservations
- Fees calculated automatically using Decorator pattern

---

### Get User Borrows

**GET** `/borrow`

Retrieve all borrow transactions for the authenticated user.

**Authentication:** Required

**Response:** `200 OK`

```json
[
  {
    "id": "d4e5f6a7-b8c9-0123-def4-567890123456",
    "book": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "JavaScript: The Good Parts",
      "author": "Douglas Crockford"
    },
    "borrowDate": "2024-01-15T10:30:00.000Z",
    "dueDate": "2024-01-29T10:30:00.000Z",
    "returnDate": null,
    "status": "BORROWED",
    "fees": {
      "baseFee": 0,
      "lateFee": 0,
      "reservationFee": 0,
      "totalFee": 0
    },
    "paymentStatus": "PENDING",
    "paidAt": null
  },
  {
    "id": "e5f6a7b8-c9d0-1234-ef56-789012345678",
    "book": {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "title": "Eloquent JavaScript",
      "author": "Marijn Haverbeke"
    },
    "borrowDate": "2024-01-10T10:30:00.000Z",
    "dueDate": "2024-01-24T10:30:00.000Z",
    "returnDate": "2024-01-20T14:30:00.000Z",
    "status": "RETURNED",
    "fees": {
      "baseFee": 0,
      "lateFee": 5,
      "reservationFee": 0,
      "totalFee": 5
    },
    "paymentStatus": "PAID",
    "paidAt": "2024-01-20T15:00:00.000Z"
  }
]
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated

---

## User Endpoints

### Get User Profile

**GET** `/users/profile`

Retrieve the authenticated user's profile information.

**Authentication:** Required

**Response:** `200 OK`

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "STUDENT",
  "maxBorrowLimit": 3
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated
- `404 Not Found` - User not found

---

### Update User Profile

**PUT** `/users/profile`

Update the authenticated user's profile information. Users can update their name and email, but cannot modify borrow limit or role.

**Authentication:** Required

**Request Body:**

```json
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

**Response:** `200 OK`

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Updated Name",
  "email": "newemail@example.com",
  "role": "STUDENT",
  "maxBorrowLimit": 3
}
```

**Error Responses:**

- `400 Bad Request` - Invalid data
- `401 Unauthorized` - Not authenticated
- `409 Conflict` - Email already taken by another user

---

### Change Password

**PATCH** `/users/profile/password`

Change the authenticated user's password.

**Authentication:** Required

**Request Body:**

```json
{
  "oldPassword": "currentpassword",
  "newPassword": "newpassword123"
}
```

**Response:** `200 OK`

```json
{
  "message": "Password updated successfully"
}
```

**Error Responses:**

- `400 Bad Request` - Missing oldPassword or newPassword
- `401 Unauthorized` - Not authenticated or invalid old password

---

### Get Borrowed Count

**GET** `/users/borrowed-count`

Retrieve the number of books currently borrowed by the authenticated user.

**Authentication:** Required

**Response:** `200 OK`

```json
{
  "count": 2
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated

---

## Librarian Endpoints

### Get All Books

**GET** `/librarians/books`

Retrieve all books in the library catalogue (librarian view).

**Authentication:** Required (Librarian only)

**Response:** `200 OK`

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "JavaScript: The Good Parts",
    "author": "Douglas Crockford",
    "isbn": "978-0596517748",
    "totalCopies": 5,
    "availableCopies": 3
  }
]
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated or not a librarian

---

### Get All Borrows

**GET** `/librarians/borrows`

Retrieve all borrow transactions in the system (librarian view).

**Authentication:** Required (Librarian only)

**Response:** `200 OK`

```json
[
  {
    "id": "d4e5f6a7-b8c9-0123-def4-567890123456",
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "STUDENT"
    },
    "book": {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "title": "Eloquent JavaScript",
      "author": "Marijn Haverbeke"
    },
    "borrowDate": "2024-01-15T10:30:00.000Z",
    "dueDate": "2024-01-29T10:30:00.000Z",
    "returnDate": null,
    "status": "BORROWED",
    "fees": {
      "baseFee": 0,
      "lateFee": 0,
      "reservationFee": 0,
      "totalFee": 0
    },
    "paymentStatus": "PENDING",
    "paidAt": null
  }
]
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated or not a librarian

---

### Get All Users

**GET** `/librarians/users`

Retrieve all users in the system (librarian only).

**Authentication:** Required (Librarian only)

**Response:** `200 OK`

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "maxBorrowLimit": 3
  },
  {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "FACULTY",
    "maxBorrowLimit": 5
  }
]
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated or not a librarian

---

### Create User

**POST** `/librarians/users`

Create a new user account (librarian only).

**Authentication:** Required (Librarian only)

**Request Body:**

```json
{
  "name": "John Student",
  "email": "john@example.com",
  "role": "STUDENT",
  "password": "password123"
}
```

**Note:** `password` is optional - defaults to `"password123"` if not provided

**Role Options:** `STUDENT`, `FACULTY`, `LIBRARIAN`

**Response:** `201 Created`

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "John Student",
  "email": "john@example.com",
  "role": "STUDENT",
  "maxBorrowLimit": 3
}
```

**Error Responses:**

- `400 Bad Request` - Missing required fields or invalid role
- `401 Unauthorized` - Not authenticated or not a librarian
- `409 Conflict` - User with email already exists

---

### Update User

**PUT** `/librarians/users/:id`

Update user information (name, email, password, role, borrow limit).

**Authentication:** Required (Librarian only)

**URL Parameters:**

- `id` - User ID (UUID)

**Request Body:**

```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "password": "newpassword123",
  "role": "FACULTY",
  "maxBorrowLimit": 5
}
```

**Note:** All fields are optional - only include fields you want to update

**Response:** `200 OK`

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Updated Name",
  "email": "newemail@example.com",
  "role": "FACULTY",
  "maxBorrowLimit": 5
}
```

**Error Responses:**

- `400 Bad Request` - Invalid data
- `401 Unauthorized` - Not authenticated or not a librarian
- `404 Not Found` - User not found
- `409 Conflict` - Email already taken by another user

---

### Delete User

**DELETE** `/librarians/users/:id`

Delete a user account (librarian only).

**Authentication:** Required (Librarian only)

**URL Parameters:**

- `id` - User ID (UUID)

**Example:** `DELETE /librarians/users/a1b2c3d4-e5f6-7890-abcd-ef1234567890`

**Response:** `204 No Content`

**Error Responses:**

- `401 Unauthorized` - Not authenticated or not a librarian
- `404 Not Found` - User not found
- `400 Bad Request` - Cannot delete your own account

---

### Update User Role

**PATCH** `/librarians/users/:id/role`

Change a user's role (librarian only).

**Authentication:** Required (Librarian only)

**URL Parameters:**

- `id` - User ID (UUID)

**Request Body:**

```json
{
  "role": "FACULTY"
}
```

**Role Options:** `STUDENT`, `FACULTY`, `LIBRARIAN`

**Example:** `PATCH /librarians/users/a1b2c3d4-e5f6-7890-abcd-ef1234567890/role`

**Response:** `200 OK`

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "FACULTY",
  "maxBorrowLimit": 5
}
```

**Error Responses:**

- `400 Bad Request` - Invalid role or cannot change your own role
- `401 Unauthorized` - Not authenticated or not a librarian
- `404 Not Found` - User not found

---

## Payment Endpoints

### Create Payment Intent

**POST** `/payments/create-intent`

Create a Stripe Checkout session for paying transaction fees.

**Authentication:** Required

**Request Body:**

```json
{
  "transactionId": "d4e5f6a7-b8c9-0123-def4-567890123456"
}
```

**Response:** `200 OK`

```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

**Error Responses:**

- `400 Bad Request` - Missing transactionId or fees already paid
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Transaction not found
- `400 Bad Request` - Transaction does not belong to user

---

### Verify Payment

**GET** `/payments/verify`

Verify payment status for a Stripe Checkout session.

**Authentication:** Required

**Query Parameters:**

- `sessionId` - Stripe Checkout session ID

**Example:** `GET /payments/verify?sessionId=cs_test_...`

**Response:** `200 OK`

```json
{
  "paid": true,
  "transactionId": "d4e5f6a7-b8c9-0123-def4-567890123456",
  "updated": true,
  "paymentStatus": "PAID"
}
```

**Error Responses:**

- `400 Bad Request` - Missing sessionId
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Payment verification failed

---

### Payment Webhook

**POST** `/payments/webhook`

Stripe webhook endpoint for payment event notifications. This endpoint should be configured in Stripe Dashboard.

**Authentication:** Not required (uses Stripe signature verification)

**Note:** This endpoint requires raw request body for signature verification. Configure in Stripe Dashboard with webhook signing secret.

---

## Reservation Endpoints

### Create Reservation

**POST** `/reservations`

Create a reservation for a book that is currently unavailable or has active reservations.

**Authentication:** Required

**Request Body:**

```json
{
  "bookId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Response:** `201 Created`

```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "bookId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "PENDING",
  "createdAt": "2025-11-28T12:00:00.000Z"
}
```

**Error Responses:**

- `400 Bad Request` - Missing bookId
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Book not found
- `409 Conflict` - User already has a pending reservation for this book

---

### Get User Reservations

**GET** `/reservations`

Get all reservations for the authenticated user.

**Authentication:** Required

**Response:** `200 OK`

```json
[
  {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "bookId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "book": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "isbn": "978-0743273565",
      "available": false
    },
    "status": "PENDING",
    "createdAt": "2025-11-28T12:00:00.000Z"
  }
]
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated

---

### Cancel Reservation

**DELETE** `/reservations/:id`

Cancel a pending reservation.

**Authentication:** Required

**Response:** `200 OK`

```json
{
  "message": "Reservation cancelled successfully"
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Reservation does not belong to user
- `404 Not Found` - Reservation not found
- `400 Bad Request` - Only pending reservations can be cancelled

---

## Notification Endpoints

### Get User Notifications

**GET** `/notifications`

Get all notifications for the authenticated user, sorted by most recent first.

**Authentication:** Required

**Response:** `200 OK`

```json
[
  {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "message": "Book \"The Great Gatsby\" is now available for you.",
    "isRead": false,
    "createdAt": "2025-11-28T12:00:00.000Z"
  }
]
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated

---

### Get Unread Notification Count

**GET** `/notifications/unread-count`

Get the count of unread notifications for the authenticated user.

**Authentication:** Required

**Response:** `200 OK`

```json
{
  "count": 3
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated

---

### Mark Notification as Read

**PATCH** `/notifications/:id/read`

Mark a specific notification as read.

**Authentication:** Required

**Response:** `200 OK`

```json
{
  "message": "Notification marked as read"
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Notification not found

---

### Mark All Notifications as Read

**PATCH** `/notifications/read-all`

Mark all unread notifications for the authenticated user as read.

**Authentication:** Required

**Response:** `200 OK`

```json
{
  "message": "All notifications marked as read"
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated

---

## Error Responses

All endpoints may return the following standard error responses:

### 400 Bad Request

```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized

```json
{
  "error": "Invalid or expired token"
}
```

or

```json
{
  "error": "Invalid email or password"
}
```

### 403 Forbidden

```json
{
  "error": "Access denied. Librarian role required."
}
```

### 404 Not Found

```json
{
  "error": "Book not found"
}
```

### 409 Conflict

```json
{
  "error": "User with this email already exists"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal Server Error"
}
```

---

## System Configuration

### Authentication

- **Method:** Cookie-based authentication with HttpOnly cookies
- **Token Type:** JWT (JSON Web Token)
- **Token Expiration:** 7 days (configurable via `JWT_EXPIRES_IN` environment variable)
- **Fallback:** Authorization header with Bearer token for API clients

### Borrow Limits

- **Students:** 3 books maximum
- **Faculty:** 5 books maximum
- **Librarians:** 10 books maximum

### Borrowing Period

- **Standard Period:** 14 days from borrow date
- **Due Date Calculation:** Automatically set to 14 days after borrow date

### Fee Structure

- **Base Fee:** $0 (configurable)
- **Late Fee:** $5 per overdue return
- **Reservation Fee:** $2 if book has pending reservations
- **Payment:** Integrated with Stripe Checkout for fee payment processing

### Book Availability

Books are automatically marked as unavailable when borrowed and available when returned. The system maintains accurate availability counts.

### Reservation System

- **Reservation Queue:** Books with active reservations follow a FIFO (First In, First Out) queue system
- **Reservation Status:** PENDING (waiting), NOTIFIED (book available, user notified), CANCELLED (cancelled or fulfilled)
- **Borrowing Rules:** When a book has active reservations, only the first person in the queue can borrow it. Others will receive an error message prompting them to reserve the book
- **Automatic Cancellation:** When a reserved user borrows a book, their reservation is automatically cancelled
- **Book Availability:** Books with reservations show both "Borrow" and "Reserve" buttons when available, allowing users to join the queue

### Notification System

- **Automatic Notifications:** Users are automatically notified when a reserved book becomes available
- **Notification Storage:** All notifications are stored in the database for user access
- **Read Status:** Notifications can be marked as read individually or all at once
- **Real-time Updates:** Frontend polls for new notifications every 30 seconds

### Observer Pattern Implementation

When a book is returned, the system automatically:

- Notifies the librarian via `LibrarianObserver`
- Updates the library catalogue via `CatalogueObserver`
- Notifies the first user in the reservation queue via `WaitlistObserver` (if any reservations exist)
- Updates the reservation status from PENDING to NOTIFIED when user is notified

### Role-Based Access Control

- **Librarian-Only Operations:**

  - Add, update, and remove books
  - View all users and their borrows
  - Create, update, and delete user accounts
  - Change user roles

- **User Restrictions:**

  - Cannot register as LIBRARIAN (only librarians can create librarian accounts)
  - Cannot modify their own borrow limit or role
  - Can only view their own borrow transactions

- **General Access:**
  - All authenticated users can borrow and return books
  - All users can search and browse books
  - All users can update their own profile (name, email, password)

### Identifier System

- **ID Format:** UUID v4 strings (e.g., `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`)
- **Security Benefits:** Cannot be guessed or enumerated, more secure than sequential integer IDs

---

## Quick Start Examples

### 1. Register a New User

```bash
curl -X POST http://localhost:3004/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "STUDENT"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3004/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Search Books

```bash
curl http://localhost:3004/api/books?q=javascript
```

### 4. Borrow a Book

```bash
curl -X POST http://localhost:3004/api/borrow \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "bookId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }'
```

### 5. Return a Book

```bash
curl -X POST http://localhost:3004/api/borrow/return \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "bookId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }'
```

### 6. Librarian: Get All Users

```bash
curl http://localhost:3004/api/librarians/users \
  -b cookies.txt
```

### 7. Librarian: Create a New User

```bash
curl -X POST http://localhost:3004/api/librarians/users \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "New Student",
    "email": "student@example.com",
    "role": "STUDENT",
    "password": "password123"
  }'
```

### 8. Librarian: Update User Role

```bash
curl -X PATCH http://localhost:3004/api/librarians/users/<user-id>/role \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "role": "FACULTY"
  }'
```

### 9. Pay Transaction Fees

```bash
curl -X POST http://localhost:3004/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "transactionId": "d4e5f6a7-b8c9-0123-def4-567890123456"
  }'
```

### 10. Reserve a Book

```bash
curl -X POST http://localhost:3004/api/reservations \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "bookId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }'
```

### 11. Get My Reservations

```bash
curl http://localhost:3004/api/reservations \
  -b cookies.txt
```

### 12. Cancel a Reservation

```bash
curl -X DELETE http://localhost:3004/api/reservations/<reservation-id> \
  -b cookies.txt
```

### 13. Get My Notifications

```bash
curl http://localhost:3004/api/notifications \
  -b cookies.txt
```

### 14. Get Unread Notification Count

```bash
curl http://localhost:3004/api/notifications/unread-count \
  -b cookies.txt
```

### 15. Mark Notification as Read

```bash
curl -X PATCH http://localhost:3004/api/notifications/<notification-id>/read \
  -b cookies.txt
```

---

## Additional Notes

1. **Cookie Management:** When using cookie-based authentication, ensure cookies are sent with requests using the `-b cookies.txt` flag in curl or appropriate cookie handling in your client.

2. **CORS Configuration:** The API is configured to accept requests from the frontend origin specified in `FRONTEND_URL` environment variable.

3. **Database:** The system uses MySQL with Sequelize ORM. Database schema is automatically synchronized in development mode.

4. **Payment Processing:** Stripe integration requires proper webhook configuration in Stripe Dashboard for reliable payment status updates.

5. **Error Handling:** All endpoints implement comprehensive error handling with appropriate HTTP status codes and error messages.
