# Library Management System - System Architecture and Flow Documentation

## Overview

This document provides a comprehensive overview of the Library Management System architecture, including system flow diagrams, component interactions, and the integration between frontend and backend systems.

## System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        ReactApp[React Frontend Application]
    end

    subgraph "Frontend Components"
        AuthContext[Authentication Context]
        Pages[Page Components]
        Components[UI Components]
        API[API Client]
    end

    subgraph "Network Layer"
        HTTP[HTTP/HTTPS]
        Cookies[HttpOnly Cookies]
    end

    subgraph "Backend Server"
        Express[Express.js Server]
        Middleware[Middleware Layer]
        Routes[Route Handlers]
        Controllers[Controllers]
        Services[Service Layer]
        Repositories[Repository Layer]
        Domain[Domain Entities]
    end

    subgraph "External Services"
        Stripe[Stripe Payment Gateway]
        Webhook[Stripe Webhooks]
    end

    subgraph "Data Layer"
        ORM[Sequelize ORM]
        MySQL[(MySQL Database)]
    end

    Browser --> ReactApp
    ReactApp --> AuthContext
    ReactApp --> Pages
    Pages --> Components
    Pages --> API
    API --> HTTP
    HTTP --> Cookies
    HTTP --> Express
    Express --> Middleware
    Middleware --> Routes
    Routes --> Controllers
    Controllers --> Services
    Services --> Repositories
    Services --> Domain
    Repositories --> ORM
    ORM --> MySQL
    Services --> Stripe
    Stripe --> Webhook
    Webhook --> Express
```

## Architecture Layers

### 1. Client Layer (Frontend)

**Technology Stack:**

- React 18+ with functional components and hooks
- React Router for navigation
- Context API for state management
- Axios/Fetch for HTTP requests

**Key Components:**

- **Authentication Context**: Manages user authentication state
- **Page Components**: Dashboard, Books, Transactions, Profile, Members
- **UI Components**: Reusable components (Table, Card, Input, Modal, etc.)
- **API Client**: Centralized API request handler with error management

### 2. Network Layer

**Communication Protocol:**

- HTTP/HTTPS for all API communications
- RESTful API design principles
- Cookie-based authentication (HttpOnly cookies)
- CORS configuration for cross-origin requests

**Security Features:**

- HttpOnly cookies prevent XSS attacks
- SameSite attribute provides CSRF protection
- Secure flag in production for HTTPS-only cookies

### 3. Backend Server Layer

**Technology Stack:**

- Node.js runtime environment
- Express.js web framework
- Cookie parser middleware
- CORS middleware

**Request Processing Flow:**

1. Request received by Express server
2. CORS middleware validates origin
3. Cookie parser extracts authentication cookies
4. JSON parser processes request body
5. Routes match request to appropriate handler
6. Authentication middleware verifies user
7. Controller processes business logic
8. Response sent back to client

### 4. Application Layer (MVC Architecture)

**Model Layer:**

- Sequelize ORM models (UserModel, BookModel, BorrowTransactionModel, ReservationModel, NotificationModel)
- Database schema definitions
- Model associations and relationships

**View Layer:**

- Not applicable (REST API architecture)
- Frontend handles all presentation

**Controller Layer:**

- AuthController: Authentication operations
- BookController: Book management
- BorrowController: Borrowing operations
- UserController: User profile management
- LibrarianController: Librarian-specific operations
- PaymentController: Payment processing
- ReservationController: Reservation management
- NotificationController: Notification management

### 5. Service Layer (Business Logic)

**Service Classes:**

- **AuthService**: User registration, login, token management
- **BookService**: Book CRUD operations, search functionality, reservation status checking
- **ReservationService**: Reservation creation, retrieval, cancellation
- **NotificationService**: Notification creation, retrieval, read status management
- **BorrowService**: Borrowing, returning, fee calculation, reservation queue management
- **UserService**: User management, profile updates
- **PaymentService**: Stripe integration, payment processing
- **FeeService**: Fee calculation using Decorator pattern

**Design Patterns Implementation:**

- **Factory Pattern**: UserFactory creates user instances
- **Singleton Pattern**: LibraryCatalogue maintains single instance
- **Observer Pattern**: BookReturnSubject with multiple observers
- **Decorator Pattern**: Fee calculation composition

### 6. Repository Layer (Data Access)

**Repository Classes:**

- **UserRepository**: User data access operations
- **BookRepository**: Book data access operations
- **BorrowTransactionRepository**: Transaction data access
- **ReservationRepository**: Reservation data access, queue management
- **NotificationRepository**: Notification data access, read status management

**Responsibilities:**

- Abstract database operations from business logic
- Convert database rows to domain entities
- Handle data persistence and retrieval
- Maintain separation of concerns

### 7. Domain Layer (Domain Entities)

**Entity Classes:**

- **User**: Base user entity with role-based subclasses
- **Book**: Book domain entity with availability logic
- **BorrowTransaction**: Transaction entity with business rules
- **LibraryCatalogue**: Singleton catalogue management

**Business Rules:**

- Encapsulated within domain entities
- Validation and state management
- Domain-specific methods and behaviors

### 8. Data Layer

**Database:**

- MySQL relational database
- Sequelize ORM for database abstraction
- Connection pooling for performance
- Transaction support for data integrity

**Database Operations:**

- Automatic schema synchronization (development)
- Migration support for production
- Foreign key constraints for referential integrity
- Indexes for query optimization

## Complete System Flow

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant AuthController
    participant AuthService
    participant UserRepository
    participant Database

    User->>Frontend: Enter credentials
    Frontend->>API: POST /api/auth/login
    API->>AuthController: login()
    AuthController->>AuthService: login(email, password)
    AuthService->>UserRepository: findByEmail(email)
    UserRepository->>Database: SELECT * FROM Users
    Database-->>UserRepository: User data
    UserRepository-->>AuthService: User entity
    AuthService->>AuthService: Verify password hash
    AuthService->>AuthService: Generate JWT token
    AuthService-->>AuthController: {user, token}
    AuthController->>AuthController: Set HttpOnly cookie
    AuthController-->>API: {user}
    API-->>Frontend: 200 OK with cookie
    Frontend->>Frontend: Update AuthContext
    Frontend-->>User: Redirect to Dashboard
```

### Book Borrowing Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant BorrowController
    participant BorrowService
    participant BookRepository
    participant UserRepository
    participant TransactionRepository
    participant Database
    participant Observer

    User->>Frontend: Click "Borrow" button
    Frontend->>API: POST /api/borrow {bookId}
    API->>BorrowController: borrowBook()
    BorrowController->>BorrowService: borrowBook(userId, bookId)
    BorrowService->>UserRepository: findById(userId)
    UserRepository->>Database: SELECT user
    Database-->>UserRepository: User data
    UserRepository-->>BorrowService: User entity
    BorrowService->>BorrowService: Check borrow limit
    BorrowService->>BookRepository: findById(bookId)
    BookRepository->>Database: SELECT book
    Database-->>BookRepository: Book data
    BookRepository-->>BorrowService: Book entity
    BorrowService->>BorrowService: Check availability
    BorrowService->>BorrowService: Create BorrowTransaction
    BorrowService->>BookRepository: updateAvailability()
    BookRepository->>Database: UPDATE availableCopies
    BorrowService->>TransactionRepository: save(transaction)
    TransactionRepository->>Database: INSERT transaction
    Database-->>TransactionRepository: Transaction created
    TransactionRepository-->>BorrowService: Transaction entity
    BorrowService-->>BorrowController: Transaction data
    BorrowController-->>API: 201 Created
    API-->>Frontend: Success response
    Frontend->>Frontend: Update book list
    Frontend-->>User: Show success message
```

### Book Return Flow with Fee Calculation

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant BorrowController
    participant BorrowService
    participant FeeService
    participant TransactionRepository
    participant Observer
    participant Database

    User->>Frontend: Click "Return" button
    Frontend->>API: POST /api/borrow/return {bookId}
    API->>BorrowController: returnBook()
    BorrowController->>BorrowService: returnBook(userId, bookId)
    BorrowService->>TransactionRepository: findByUserAndBook()
    TransactionRepository->>Database: SELECT transaction
    Database-->>TransactionRepository: Transaction data
    TransactionRepository-->>BorrowService: Transaction entity
    BorrowService->>BorrowService: Calculate days overdue
    BorrowService->>FeeService: calculateFees(transaction)
    FeeService->>FeeService: Apply Decorator pattern
    FeeService->>FeeService: Calculate late fee
    FeeService->>FeeService: Calculate reservation fee
    FeeService-->>BorrowService: Fee breakdown
    BorrowService->>TransactionRepository: Update transaction
    TransactionRepository->>Database: UPDATE transaction
    BorrowService->>Observer: Notify observers (return event)
    Observer->>Observer: LibrarianObserver
    Observer->>Observer: CatalogueObserver
    Observer->>Observer: WaitlistObserver
    Database-->>TransactionRepository: Updated
    TransactionRepository-->>BorrowService: Updated transaction
    BorrowService-->>BorrowController: Return data with fees
    BorrowController-->>API: 200 OK
    API-->>Frontend: Transaction with fees
    Frontend->>Frontend: Show fee information
    Frontend-->>User: Display fees and payment option
```

### Payment Processing Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant PaymentController
    participant PaymentService
    participant Stripe
    participant Webhook
    participant Database

    User->>Frontend: Click "Pay Fees"
    Frontend->>API: POST /api/payments/create-intent
    API->>PaymentController: createPaymentIntent()
    PaymentController->>PaymentService: createPaymentIntent(transactionId)
    PaymentService->>Database: Load transaction
    PaymentService->>PaymentService: Calculate total fee
    PaymentService->>Stripe: Create Checkout Session
    Stripe-->>PaymentService: Session URL
    PaymentService-->>PaymentController: {sessionId, url}
    PaymentController-->>API: Payment URL
    API-->>Frontend: Redirect URL
    Frontend->>Stripe: Redirect to Checkout
    User->>Stripe: Complete payment
    Stripe->>Webhook: Payment completed event
    Webhook->>API: POST /api/payments/webhook
    API->>PaymentController: handleWebhook()
    PaymentController->>PaymentService: handleWebhook()
    PaymentService->>Database: Update payment status
    Stripe-->>Frontend: Redirect to success URL
    Frontend->>API: GET /api/payments/verify
    API->>PaymentController: verifyPayment()
    PaymentController->>PaymentService: verifyPayment()
    PaymentService->>Database: Confirm payment status
    PaymentService-->>PaymentController: Payment verified
    PaymentController-->>API: {paid: true}
    API-->>Frontend: Payment confirmed
    Frontend->>Frontend: Refresh transactions
    Frontend-->>User: Show "Paid" status
```

### Book Reservation Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant ReservationController
    participant ReservationService
    participant ReservationRepository
    participant BookRepository
    participant Database

    User->>Frontend: Click "Reserve" button
    Frontend->>API: POST /api/reservations {bookId}
    API->>ReservationController: createReservation()
    ReservationController->>ReservationService: createReservation(userId, bookId)
    ReservationService->>BookRepository: findById(bookId)
    BookRepository->>Database: SELECT book
    Database-->>BookRepository: Book data
    BookRepository-->>ReservationService: Book entity
    ReservationService->>ReservationRepository: findByUserId(userId)
    ReservationRepository->>Database: SELECT reservations
    Database-->>ReservationRepository: Existing reservations
    ReservationRepository-->>ReservationService: Reservations list
    ReservationService->>ReservationService: Check for duplicate reservation
    ReservationService->>ReservationRepository: create(userId, bookId)
    ReservationRepository->>Database: INSERT reservation
    Database-->>ReservationRepository: Reservation created
    ReservationRepository-->>ReservationService: Reservation entity
    ReservationService-->>ReservationController: Reservation data
    ReservationController-->>API: 201 Created
    API-->>Frontend: Success response
    Frontend-->>User: Show success message
```

### Book Return with Reservation Notification Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant BorrowController
    participant BorrowService
    participant WaitlistObserver
    participant NotificationService
    participant NotificationRepository
    participant ReservationRepository
    participant Database

    User->>Frontend: Click "Return" button
    Frontend->>API: POST /api/borrow/return {bookId}
    API->>BorrowController: returnBook()
    BorrowController->>BorrowService: returnBook(userId, bookId)
    BorrowService->>BorrowService: Process return and calculate fees
    BorrowService->>BorrowService: Notify observers (book returned)
    BorrowService->>WaitlistObserver: update(book, user)
    WaitlistObserver->>ReservationRepository: getNextPending(bookId)
    ReservationRepository->>Database: SELECT first pending reservation
    Database-->>ReservationRepository: Reservation data
    ReservationRepository-->>WaitlistObserver: Next reservation
    WaitlistObserver->>NotificationService: notifyUser(userId, message)
    NotificationService->>NotificationRepository: create(userId, message)
    NotificationRepository->>Database: INSERT notification
    WaitlistObserver->>ReservationRepository: updateStatus(id, "NOTIFIED")
    ReservationRepository->>Database: UPDATE reservation status
    Database-->>WaitlistObserver: Status updated
    WaitlistObserver-->>BorrowService: Notification sent
    BorrowService-->>BorrowController: Return complete
    BorrowController-->>API: 200 OK
    API-->>Frontend: Return success
    Frontend-->>User: Show return confirmation
```

### Book Borrow with Reservation Queue Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant BorrowController
    participant BorrowService
    participant ReservationRepository
    participant Database

    User->>Frontend: Click "Borrow" button
    Frontend->>API: POST /api/borrow {bookId}
    API->>BorrowController: borrowBook()
    BorrowController->>BorrowService: borrowBook(userId, bookId)
    BorrowService->>BorrowService: Check borrow limit
    BorrowService->>BorrowService: Check book availability
    BorrowService->>ReservationRepository: findByBookId(bookId)
    ReservationRepository->>Database: SELECT active reservations
    Database-->>ReservationRepository: Reservations list
    ReservationRepository-->>BorrowService: Active reservations
    alt Book has reservations
        BorrowService->>BorrowService: Check if user is first in queue
        alt User is first in queue
            BorrowService->>BorrowService: Allow borrow, cancel user's reservation
        else User is not first in queue
            BorrowService-->>BorrowController: Error: "Book has been reserved"
            BorrowController-->>API: 400 Bad Request
            API-->>Frontend: Error message
            Frontend-->>User: Show error: "Please reserve to be notified"
        end
    else Book has no reservations
        BorrowService->>BorrowService: Allow borrow
    end
    BorrowService->>Database: Save transaction
    BorrowService-->>BorrowController: Success
    BorrowController-->>API: 201 Created
    API-->>Frontend: Success response
    Frontend-->>User: Show success message
```

### Notification Retrieval Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant NotificationController
    participant NotificationService
    participant NotificationRepository
    participant Database

    User->>Frontend: Open notifications dropdown
    Frontend->>API: GET /api/notifications
    API->>NotificationController: getUserNotifications()
    NotificationController->>NotificationService: getUserNotifications(userId)
    NotificationService->>NotificationRepository: findByUserId(userId)
    NotificationRepository->>Database: SELECT notifications ORDER BY createdAt DESC
    Database-->>NotificationRepository: Notifications list
    NotificationRepository-->>NotificationService: Notifications array
    NotificationService-->>NotificationController: Notifications
    NotificationController-->>API: 200 OK
    API-->>Frontend: Notifications array
    Frontend->>Frontend: Display notifications
    Frontend-->>User: Show notification list

    User->>Frontend: Click notification
    Frontend->>API: PATCH /api/notifications/:id/read
    API->>NotificationController: markAsRead()
    NotificationController->>NotificationService: markAsRead(notificationId, userId)
    NotificationService->>NotificationRepository: markAsRead(notificationId, userId)
    NotificationRepository->>Database: UPDATE isRead = true
    Database-->>NotificationRepository: Updated
    NotificationRepository-->>NotificationService: Success
    NotificationService-->>NotificationController: Success
    NotificationController-->>API: 200 OK
    API-->>Frontend: Success
    Frontend->>Frontend: Update notification UI
```

### Librarian User Management Flow

```mermaid
sequenceDiagram
    participant Librarian
    participant Frontend
    participant API
    participant LibrarianController
    participant UserService
    participant UserRepository
    participant Database

    Librarian->>Frontend: View Members page
    Frontend->>API: GET /api/librarians/users
    API->>LibrarianController: getAllUsers()
    LibrarianController->>UserService: getAllUsers()
    UserService->>UserRepository: findAll()
    UserRepository->>Database: SELECT * FROM Users
    Database-->>UserRepository: All users
    UserRepository-->>UserService: User entities
    UserService-->>LibrarianController: User list
    LibrarianController-->>API: User array
    API-->>Frontend: All users
    Frontend-->>Librarian: Display user table

    Librarian->>Frontend: Click "Edit" user
    Frontend->>Frontend: Show edit modal
    Librarian->>Frontend: Update user data
    Frontend->>API: PUT /api/librarians/users/:id
    API->>LibrarianController: updateUser()
    LibrarianController->>UserService: updateUser(id, data)
    UserService->>UserRepository: findById(id)
    UserRepository->>Database: SELECT user
    Database-->>UserRepository: User data
    UserRepository-->>UserService: User entity
    UserService->>UserService: Update user fields
    UserService->>UserRepository: save(user)
    UserRepository->>Database: UPDATE user
    Database-->>UserRepository: Updated
    UserRepository-->>UserService: Updated user
    UserService-->>LibrarianController: Updated user
    LibrarianController-->>API: 200 OK
    API-->>Frontend: Updated user
    Frontend->>Frontend: Refresh user list
    Frontend-->>Librarian: Show updated data
```

## Frontend-Backend Integration

### API Communication Pattern

**Request Flow:**

1. User interaction triggers frontend event handler
2. Frontend component calls API client function
3. API client constructs HTTP request with:
   - Endpoint URL
   - HTTP method (GET, POST, PUT, DELETE, PATCH)
   - Request body (if applicable)
   - Cookies automatically included (credentials: "include")
4. Request sent to backend API
5. Backend processes request through middleware and controllers
6. Response returned to frontend
7. Frontend updates UI based on response

**Error Handling:**

- API client catches HTTP errors
- Error messages displayed to user via toast notifications
- Network errors handled gracefully
- Authentication errors trigger logout and redirect

### State Management

**Authentication State:**

- Managed by AuthContext using React Context API
- User information stored in context
- Authentication status checked on app initialization
- Logout clears context and cookies

**Data State:**

- Component-level state using useState hook
- Data fetched on component mount using useEffect
- State updates trigger UI re-renders
- Optimistic updates for better UX

**Shared State:**

- MembersContext for librarian user management
- Shared across multiple components
- Centralized data fetching and caching

### Real-time Updates

**Transaction Status:**

- Frontend polls for payment status after redirect
- Webhook updates database asynchronously
- Frontend refreshes data to show latest status
- Multiple refresh attempts ensure consistency

**Book Availability:**

- Updated immediately after borrow/return operations
- Frontend optimistically updates UI
- Backend confirms actual availability
- Discrepancies resolved on next data fetch

**Notifications:**

- Frontend polls for new notifications every 30 seconds
- Unread count displayed in notification bell icon
- Notifications automatically created when reserved books become available
- Real-time updates when notifications are marked as read

**Reservations:**

- Reservation status updated in real-time
- Books with reservations show both Borrow and Reserve buttons
- Reservation queue enforced on backend (FIFO system)

## Security Architecture

### Authentication Security

**Cookie-Based Authentication:**

- HttpOnly flag prevents JavaScript access (XSS protection)
- SameSite attribute prevents CSRF attacks
- Secure flag in production (HTTPS only)
- Expiration set to match JWT token lifetime

**Token Security:**

- JWT tokens signed with secret key
- Token expiration enforced (7 days)
- Token verification on every protected request
- Invalid tokens trigger immediate logout

### Authorization Security

**Role-Based Access Control:**

- User role stored in JWT token
- Middleware checks role before route access
- Librarian-only endpoints protected
- User-specific data access enforced

**Data Access Control:**

- Users can only access their own data
- Librarians can access all data
- Foreign key constraints prevent data manipulation
- Input validation prevents injection attacks

## Performance Considerations

### Frontend Optimization

**Code Splitting:**

- React Router lazy loading
- Component-level code splitting
- Reduced initial bundle size

**Data Fetching:**

- Debounced search queries
- Cached API responses
- Optimistic UI updates
- Minimal unnecessary re-renders

### Backend Optimization

**Database Queries:**

- Indexed foreign keys for fast joins
- Efficient query patterns
- Connection pooling
- Transaction batching where appropriate

**Caching Strategy:**

- LibraryCatalogue singleton for in-memory cache
- Reduced database queries
- Fast availability checks

## Error Handling Flow

```mermaid
graph TD
    A[User Action] --> B{Request Type}
    B -->|API Request| C[API Client]
    C --> D{Response Status}
    D -->|200-299| E[Success Handler]
    D -->|400-499| F[Client Error Handler]
    D -->|500-599| G[Server Error Handler]
    D -->|Network Error| H[Network Error Handler]
    F --> I[Display Error Message]
    G --> I
    H --> I
    E --> J[Update UI]
    I --> K[User Notification]
    J --> L[User Sees Result]
    K --> L
```

## System Integration Points

### Frontend Integration Points

1. **Authentication API**: `/api/auth/*`

   - Login, register, logout
   - Cookie management
   - User context updates

2. **Book API**: `/api/books`

   - Search and browse
   - Librarian CRUD operations
   - Availability updates

3. **Borrow API**: `/api/borrow`

   - Borrow and return operations
   - Transaction history
   - Fee information

4. **User API**: `/api/users`

   - Profile management
   - Self-service updates
   - Borrowed count

5. **Librarian API**: `/api/librarians/*`

   - User management
   - All transactions view
   - Dashboard statistics

6. **Payment API**: `/api/payments/*`
   - Payment intent creation
   - Payment verification
   - Webhook handling

### Backend Integration Points

1. **Database**: MySQL via Sequelize ORM

   - All data persistence
   - Transaction management
   - Query optimization

2. **Stripe API**: Payment processing

   - Checkout session creation
   - Payment verification
   - Webhook event handling

3. **External Services**: (Future)
   - Email service for notifications
   - SMS service for alerts
   - File storage for documents

## Deployment Architecture

### Development Environment

```
Frontend (Vite Dev Server) → http://localhost:5173
Backend (Node.js) → http://localhost:3004
Database (MySQL) → localhost:3306
```

### Production Environment

```
Frontend (Static Build) → CDN/Web Server
Backend (Node.js) → Application Server
Database (MySQL) → Database Server
Stripe → External Payment Gateway
```

## Summary

The Library Management System follows a modern, layered architecture:

1. **Frontend**: React-based SPA with component-based architecture
2. **Backend**: Express.js REST API with MVC pattern
3. **Database**: MySQL with Sequelize ORM
4. **Integration**: Cookie-based authentication, Stripe payments
5. **Patterns**: Factory, Singleton, Observer, Decorator patterns
6. **Security**: HttpOnly cookies, role-based access, input validation
7. **Performance**: Code splitting, query optimization, caching

The system provides a complete, secure, and scalable solution for library management with clear separation of concerns and maintainable code structure.
