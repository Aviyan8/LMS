# Library Management System - Backend Features Documentation

## Overview

This document provides a comprehensive overview of the backend implementation for the Library Management System. The system is built using Node.js with Express.js framework, following Object-Oriented Programming principles, design patterns, and Model-View-Controller (MVC) architecture.

## Architecture Components

### Step 1: Core Domain Objects (Object-Oriented Programming)

The system implements the following core domain entities:

**Book Entity**

- Properties: title, author, ISBN, totalCopies, availableCopies
- Methods: `isAvailable()`, `markAsBorrowed()`, `markAsReturned()`
- Encapsulates book availability logic and state management

**User Entity Hierarchy**

- Base class: `User` with properties: name, email, role, maxBorrowLimit
- Methods: `canBorrow()`, `getRole()`
- Derived classes:
  - `StudentUser`: Extends User with maxBorrowLimit of 3
  - `FacultyUser`: Extends User with maxBorrowLimit of 5
  - `Librarian`: Extends User with maxBorrowLimit of 10

**LibraryCatalogue**

- Implements Singleton pattern to ensure single instance
- Methods: `addBook()`, `removeBook()`, `findByTitle()`, `findByIsbn()`, `updateBook()`
- Maintains centralized book inventory management

**BorrowTransaction**

- Tracks borrowing and returning operations
- Properties: borrowDate, dueDate, returnDate, status, fees
- Methods: `markReturned()`, `isOverdue()`

### Step 2: Design Patterns Implementation

**Singleton Pattern**

- `LibraryCatalogue` class ensures only one instance exists throughout the application lifecycle
- Provides centralized access to book inventory

**Factory Pattern**

- `UserFactory` class creates appropriate user instances based on role
- Supports creation of StudentUser, FacultyUser, and Librarian objects
- Encapsulates user creation logic and ensures proper initialization

**Observer Pattern**

- `BookReturnSubject` acts as the subject for book return events
- Observers implemented:
  - `LibrarianObserver`: Notifies librarian when books are returned
  - `CatalogueObserver`: Updates library catalogue upon book return
  - `WaitlistObserver`: Notifies users waiting for books when they become available
- Enables decoupled event-driven notifications

**Decorator Pattern**

- Fee calculation system implemented using decorators:
  - `BasicBorrowCost`: Base fee component
  - `LateFeeDecorator`: Adds late fee calculation
  - `ReservationFeeDecorator`: Adds reservation fee calculation
- Allows dynamic composition of fee calculations

### Step 3: MVC Architecture

**Models**

- Sequelize ORM models for database interaction:
  - BookModel: Represents books in the database
  - UserModel: Represents users in the database
  - BorrowTransactionModel: Represents borrow transactions
  - ReservationModel: Represents book reservations
- Handles data persistence and database operations

**Controllers**

- Express.js controllers for request handling:
  - AuthController: Handles authentication operations
  - BookController: Manages book-related operations
  - BorrowController: Handles borrowing and returning operations
  - UserController: Manages user profile operations
  - LibrarianController: Provides librarian-specific operations
- Implements business logic and coordinates between models and services

**Views**

- Not applicable (REST API architecture)
- Frontend application handles presentation layer

## Core Features

### 1. User Authentication and Authorization

**Registration**

- Endpoint: `POST /api/auth/register`
- Allows new users to create accounts
- Role-based registration: STUDENT and FACULTY roles available
- LIBRARIAN role creation restricted to existing librarians

**Login**

- Endpoint: `POST /api/auth/login`
- Email and password-based authentication
- Returns user information upon successful authentication
- Implements cookie-based authentication using HttpOnly cookies for enhanced security

**Logout**

- Endpoint: `POST /api/auth/logout`
- Clears authentication cookies

### 2. Book Management

**Book Search and Browsing**

- Endpoint: `GET /api/books?q=query`
- Supports searching by title, author, or ISBN
- Returns all books if no query parameter provided
- Endpoint: `GET /api/books/:id` for individual book details

**Book Administration (Librarian Only)**

- Endpoint: `POST /api/books` - Add new books to catalogue
- Endpoint: `DELETE /api/books/:id` - Remove books from catalogue
- Requires librarian role authentication

### 3. Borrowing and Returning Operations

**Borrow Book**

- Endpoint: `POST /api/borrow`
- Requires user authentication
- Implements automatic borrow limit checking based on user role
- Standard borrowing period: 14 days from borrow date
- Automatically updates book availability status

**Return Book**

- Endpoint: `POST /api/borrow/return`
- Requires user authentication
- Automatically calculates fees using Decorator pattern:
  - Late fee: $5 per overdue return
  - Reservation fee: $2 if book has pending reservations
- Returns detailed fee breakdown in response

**Borrow History**

- Endpoint: `GET /api/borrow`
- Returns all borrow transactions for authenticated user
- Includes transaction status, dates, and fee information

### 4. User Notifications

**Reservation Notifications**

- Automatic notification system via Observer pattern
- `WaitlistObserver` triggers when reserved books become available
- Uses `NotificationService` for notification delivery
- Currently logs notifications (extensible for email/SMS integration)

### 5. Fee Management

**Late Fee Calculation**

- Automatic calculation upon book return
- Implemented using Decorator pattern for flexible fee composition
- Fee structure:
  - Base fee: $0 (configurable)
  - Late fee: $5 per overdue return
  - Reservation fee: $2 if book has pending reservations
- Detailed fee breakdown included in return response

**Payment Processing**

- Integration with Stripe payment gateway
- Endpoint: `POST /api/payments/create-intent` - Create payment session
- Endpoint: `GET /api/payments/verify` - Verify payment status
- Endpoint: `POST /api/payments/webhook` - Handle Stripe webhooks
- Tracks payment status (PENDING, PAID, FAILED) in transaction records

## Additional Features

**User Profile Management**

- Endpoint: `GET /api/users/profile` - Retrieve user profile
- Endpoint: `PUT /api/users/profile` - Update user profile (self-service)
- Endpoint: `PATCH /api/users/profile/password` - Change password
- Endpoint: `GET /api/users/borrowed-count` - Get current borrowed book count

**Librarian Operations**

- Endpoint: `GET /api/librarians/books` - View all books in library
- Endpoint: `GET /api/librarians/users` - View all users
- Endpoint: `GET /api/librarians/borrows` - View all borrow transactions
- Endpoint: `POST /api/librarians/users` - Create new user accounts
- Endpoint: `PUT /api/librarians/users/:id` - Update user information
- Endpoint: `DELETE /api/librarians/users/:id` - Delete user accounts
- Endpoint: `PATCH /api/librarians/users/:id/role` - Update user roles

## Database Architecture

**Database System**

- MySQL relational database
- Sequelize ORM for database abstraction and query building

**Database Tables**

- Users: Stores user account information
- Books: Maintains book catalogue data
- BorrowTransactions: Records all borrowing and returning operations
- Reservations: Tracks book reservation requests

**Database Associations**

- Properly configured relationships between entities
- Foreign key constraints for data integrity
- Cascade operations where appropriate

**Database Synchronization**

- Auto-sync enabled in development mode
- Production-ready migration support

## Security Implementation

**Password Security**

- bcryptjs library for password hashing
- Salt rounds configured for secure password storage

**Authentication**

- JWT (JSON Web Token) based authentication
- HttpOnly cookie implementation for token storage
- Prevents XSS attacks through cookie security flags
- CSRF protection via SameSite cookie attribute

**Authorization**

- Role-based access control (RBAC)
- Protected routes using authentication middleware
- Librarian-only endpoints with role verification
- User-specific data access restrictions

## Technical Notes

**Reservation System**

- Fully implemented reservation system with public API endpoints
- FIFO (First In, First Out) queue system for fair book distribution
- Reservation statuses: PENDING, NOTIFIED, CANCELLED
- Books with active reservations can only be borrowed by the first person in queue
- Automatic reservation cancellation when reserved user borrows the book
- API endpoints: POST /api/reservations, GET /api/reservations, DELETE /api/reservations/:id
- Frontend integration: Reserve button on book cards, reservations view in Profile page

**Notification Service**

- Fully implemented notification system with database storage
- Automatic notifications when reserved books become available
- Notification status tracking (read/unread)
- Real-time notification updates via polling
- API endpoints: GET /api/notifications, GET /api/notifications/unread-count, PATCH /api/notifications/:id/read, PATCH /api/notifications/read-all
- Frontend integration: Notification bell icon with dropdown, unread count badge
- Architecture supports extension for email/SMS notifications
- Observer pattern enables automatic notification triggers

**Design Pattern Integration**

- All design patterns properly implemented and integrated
- Patterns work together to provide cohesive system behavior
- Maintainable and extensible architecture

**Payment Integration**

- Stripe Checkout integration for fee payments
- Webhook support for reliable payment confirmation
- Payment status tracking in database
- Secure payment processing with proper error handling
