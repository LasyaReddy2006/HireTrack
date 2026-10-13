# HireTrack — Placement Interview Preparation Guide

This comprehensive guide is designed specifically for **CSE final-year students** preparing for software engineering and full-stack developer placement interviews. It explains every design decision, data flow, SQL query, and security concept used in **HireTrack** in simple, beginner-friendly terms.

---

## Table of Contents
1. [Project Architecture Explained Simply](#1-project-architecture-explained-simply)
2. [How React, Express, Node.js, and MySQL Work Together](#2-how-react-express-nodejs-and-mysql-work-together)
3. [Purpose of Every Important File](#3-purpose-of-every-important-file)
4. [How Registration and Login Work (Step-by-Step Flow)](#4-how-registration-and-login-work)
5. [How JWT Authentication & Authorization Work](#5-how-jwt-authentication--authorization-work)
6. [How CRUD Operations Work](#6-how-crud-operations-work)
7. [Primary Keys and Foreign Keys Explained](#7-primary-keys-and-foreign-keys-explained)
8. [Why Parameterized SQL Queries are Important (SQL Injection)](#8-why-parameterized-sql-queries-are-important)
9. [How Dashboard Statistics are Calculated](#9-how-dashboard-statistics-are-calculated)
10. [The Most Important SQL Queries Used in the Project](#10-the-most-important-sql-queries-used-in-the-project)
11. [25+ Likely Placement Interview Questions & Answers](#11-25-likely-placement-interview-questions--answers)
12. [5 Coding Tasks to Practice Rewriting Without Notes](#12-5-coding-tasks-to-practice-rewriting-without-notes)

---

## 1. Project Architecture Explained Simply

HireTrack follows the classic **Three-Tier Client-Server Architecture**:

```
+-------------------------------------------------------+
|                   1. PRESENTATION TIER                |
|           React.js SPA (Runs inside User's Browser)   |
|   - HTML/CSS UI components (Forms, Tables, Badges)    |
|   - Axios HTTP client sending JSON requests           |
+-------------------------------------------------------+
                           |
                     HTTP / REST API (JSON)
                           v
+-------------------------------------------------------+
|                    2. APPLICATION TIER                |
|        Node.js + Express Server (Runs on port 5000)   |
|   - Express Routes define API endpoints               |
|   - Controllers handle business logic & validation    |
|   - Auth Middleware checks JWT tokens & permissions   |
+-------------------------------------------------------+
                           |
                      SQL (mysql2 Connection Pool)
                           v
+-------------------------------------------------------+
|                      3. DATA TIER                     |
|           MySQL Relational Database (Port 3306)       |
|   - Users, Applications, and JobListings tables       |
|   - Enforces Foreign Key constraints & Data Integrity |
+-------------------------------------------------------+
```

### Why this architecture?
- **Separation of Concerns**: The frontend only cares about rendering the UI and handling user interaction. The backend only cares about validating business rules and executing queries. The database only cares about safely storing and indexing data.
- **Scalability**: If web traffic grows, you can deploy multiple Express backend instances behind a load balancer without touching the database schema or the React frontend.

---

## 2. How React, Express, Node.js, and MySQL Work Together

Here is the exact lifecycle of an operation (e.g. creating a job application):

1. **User Action (React)**: The student enters the company name, job title, and applied date in a React form and clicks **"Save Application"**.
2. **State & Validation (React)**: React's `useState` holds the controlled input data. The form validates that required fields are non-empty.
3. **HTTP Request (Axios)**: Axios sends an asynchronous `POST` request to `http://localhost:5000/api/applications` with:
   - Request Body: JSON payload `{ "company_name": "Google", ... }`
   - Request Headers: `Authorization: Bearer <jwt_token>` (attached automatically by the Axios interceptor).
4. **Network & CORS (Express)**: Express receives the request. The `cors` middleware verifies the request origin (`http://localhost:5173`).
5. **Authentication Check (`authMiddleware`)**:
   - Reads the token from the `Authorization` header.
   - Verifies the signature using `jwt.verify(token, secret)`.
   - Extracts the authenticated student's `user.id` and assigns it to `req.user.id`.
6. **Controller Logic (`applicationController.js`)**:
   - The controller extracts `company_name`, `job_title`, etc. from `req.body`.
   - It pairs them with `req.user.id`.
7. **Database Execution (`mysql2`)**:
   - Executes a parameterized SQL `INSERT INTO Applications ... VALUES (?, ?, ...)` using the connection pool.
   - MySQL validates foreign keys, inserts the row, and returns the auto-incremented `insertId`.
8. **Response (Express & React)**:
   - Express returns HTTP status `201 Created` with `{ success: true, applicationId: 42 }`.
   - React receives the JSON response and navigates the user back to the application table with a success banner.

---

## 3. Purpose of Every Important File

### Backend Files (`server/`)
| File Path | Purpose in Simple Terms |
| :--- | :--- |
| `server.js` | Entry point of the backend. Configures Express, CORS, JSON parsing, mounts all route handlers, handles 404s, and tests the database connection on boot. |
| `config/db.js` | Configures the `mysql2/promise` connection pool. Allows sharing connections efficiently without reopening a TCP socket on every HTTP request. |
| `config/init-db.js` | Helper script to automatically run `schema.sql` against MySQL using `npm run init-db`. |
| `config/test-db.js` | Quick CLI tool to verify if your MySQL credentials in `.env` are working. |
| `middleware/authMiddleware.js` | Intercepts requests to protected endpoints. Checks for a valid JWT Bearer token and injects `req.user` into the request object. |
| `routes/authRoutes.js` | Maps `/api/auth/register`, `/api/auth/login`, and `/api/auth/me` to controller functions. |
| `routes/applicationRoutes.js` | Maps `/api/applications` CRUD endpoints and dashboard stats routes. |
| `routes/jobRoutes.js` | Maps `/api/jobs` browsing and `/api/jobs/:id/track` endpoints. |
| `routes/profileRoutes.js` | Maps `/api/profile` viewing and updating endpoints. |
| `controllers/authController.js` | Business logic for registering new accounts, hashing passwords with bcryptjs, validating logins, and generating JWT tokens. |
| `controllers/applicationController.js` | Handles creating, listing (with search/filter/sort/pagination), viewing, editing, deleting applications, and computing dashboard stats. Enforces user isolation. |
| `controllers/jobController.js` | Fetches sample campus job listings and adds listings directly into the user's application tracker. |
| `controllers/profileController.js` | Retrieves user profile summary metrics and handles name or password updates. |

### Frontend Files (`client/`)
| File Path | Purpose in Simple Terms |
| :--- | :--- |
| `src/main.jsx` | React root file that mounts `<App />` into the DOM `div#root`. |
| `src/App.jsx` | Defines client-side routing using React Router DOM, wrapping private routes with `<ProtectedRoute>` and `<Layout>`. |
| `src/index.css` | Comprehensive vanilla CSS stylesheet containing design tokens, button styles, tables, cards, badges, and responsive rules. |
| `src/api/axios.js` / `services/api.js` | Centralized Axios instance with base URL and request/response interceptors for JWT token handling. |
| `src/context/AuthContext.jsx` | React Context providing global authentication state (`user`, `token`, `login`, `register`, `logout`) without external state libraries. |
| `src/components/Sidebar.jsx` | Navigation sidebar with brand logo, links to all main sections, and user avatar. |
| `src/components/Navbar.jsx` | Top navigation bar displaying the dynamic page title, quick action button, and user greeting. |
| `src/components/Layout.jsx` | Main shell wrapper combining Sidebar, Navbar, and `<Outlet />`. |
| `src/components/ProtectedRoute.jsx` | Guards private pages. Redirects unauthenticated users to `/login`. |
| `src/components/Badge.jsx` | Color-coded status badge for Applied, Interview, Offer, Rejected, and Withdrawn. |
| `src/components/StatCard.jsx` | Overview metric card for dashboard statistics. |
| `src/components/Modal.jsx` | Accessible modal dialog for delete confirmations. |
| `src/pages/Login.jsx` | Sign-in page with email/password validation. |
| `src/pages/Register.jsx` | Registration page with name, email, password matching validation. |
| `src/pages/Dashboard.jsx` | Main analytics dashboard displaying total counts, funnel breakdown bar, and 5 recent applications. |
| `src/pages/Applications.jsx` | Applications list with dynamic search, status/type filters, date/company sorting, and pagination. |
| `src/pages/ApplicationForm.jsx` | Reusable form for adding a new application or editing an existing one. |
| `src/pages/ApplicationDetails.jsx` | Detailed single-application card with 1-click status updates and interview notes. |
| `src/pages/JobListings.jsx` | Browse curated placement openings with 1-click tracking. |
| `src/pages/Profile.jsx` | Account settings, placement count summary, and password update forms. |

---

## 4. How Registration and Login Work

### Registration Flow:
1. User submits `name`, `email`, and `password`.
2. Backend checks if `email` already exists using:
   ```sql
   SELECT id FROM Users WHERE email = ?
   ```
3. If not found, hash the password using `bcryptjs` with 10 salt rounds:
   ```javascript
   const hashedPassword = await bcrypt.hash(password, 10);
   ```
4. Insert the new user into the database:
   ```sql
   INSERT INTO Users (name, email, password) VALUES (?, ?, ?)
   ```
5. Generate a JWT token containing `{ id: result.insertId, name, email }`.
6. Return `201 Created` with token and user details. Frontend stores token in `localStorage`.

### Login Flow:
1. User enters `email` and `password`.
2. Backend searches for the user:
   ```sql
   SELECT id, name, email, password FROM Users WHERE email = ?
   ```
3. If user does not exist, return `401 Unauthorized` (`"Invalid email or password"`).
4. If found, compare plain password with stored hash:
   ```javascript
   const isValid = await bcrypt.compare(password, user.password);
   ```
5. If match succeeds, generate and return a signed JWT token.

---

## 5. How JWT Authentication & Authorization Work

### What is a JSON Web Token (JWT)?
A JWT is a compact, URL-safe string made of three parts separated by dots (`.`):
`header.payload.signature`

1. **Header**: Contains the algorithm (e.g. `HS256`).
2. **Payload**: Contains non-sensitive claims (e.g. `userId`, `email`, expiration time).
3. **Signature**: A cryptographic hash created using `HMACSHA256(header + payload, SECRET_KEY)`.

### How does the Backend verify it?
In `server/middleware/authMiddleware.js`:
```javascript
const authHeader = req.headers['authorization'];
const token = authHeader.split(' ')[1]; // Extract token after "Bearer"
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded; // Attach user to request object
next();
```
If someone tampers with the payload (e.g. changes `userId` from 2 to 1), the signature check fails immediately because only the server knows the secret key!

### Token Storage Decision Explained:
- We store the JWT in `localStorage` and transmit it via the `Authorization: Bearer <token>` HTTP header.
- **Why this approach?** It is simple to understand, works seamlessly with REST APIs, and allows the React frontend to easily read authentication state on page refresh.

### User Isolation (Data Privacy):
Even if a logged-in user knows an application ID (e.g. ID `45` belonging to another user), our backend ensures they cannot view, modify, or delete it:
```sql
SELECT * FROM Applications WHERE id = ? AND user_id = ?
UPDATE Applications SET ... WHERE id = ? AND user_id = ?
DELETE FROM Applications WHERE id = ? AND user_id = ?
```
The `user_id` parameter always comes from `req.user.id` (extracted from the cryptographically verified JWT), never from user input!

---

## 6. How CRUD Operations Work

| Operation | HTTP Method | Endpoint | SQL Query |
| :--- | :--- | :--- | :--- |
| **Create** | `POST` | `/api/applications` | `INSERT INTO Applications (user_id, company_name, ...) VALUES (?, ?, ...)` |
| **Read (All)** | `GET` | `/api/applications` | `SELECT * FROM Applications WHERE user_id = ? ORDER BY application_date DESC LIMIT ? OFFSET ?` |
| **Read (One)** | `GET` | `/api/applications/:id` | `SELECT * FROM Applications WHERE id = ? AND user_id = ?` |
| **Update** | `PUT` | `/api/applications/:id` | `UPDATE Applications SET company_name = ?, status = ? WHERE id = ? AND user_id = ?` |
| **Delete** | `DELETE` | `/api/applications/:id` | `DELETE FROM Applications WHERE id = ? AND user_id = ?` |

---

## 7. Primary Keys and Foreign Keys Explained

### Primary Key (PK):
- A column that uniquely identifies each row in a database table.
- Example: `Users.id` and `Applications.id`.
- Characteristics: Must be unique, cannot be `NULL`, and is automatically indexed by MySQL for fast lookups.

### Foreign Key (FK):
- A column in one table that references the primary key of another table, creating a relational link.
- In HireTrack: `Applications.user_id` references `Users(id)`.
- **Relationship**: **One-to-Many** (1 User can have Many Applications, but each Application belongs to exactly 1 User).
- **ON DELETE CASCADE**: If a user account is deleted, MySQL automatically deletes all job applications belonging to that user. This prevents "orphaned records" from cluttering the database.

---

## 8. Why Parameterized SQL Queries are Important

### The Danger: SQL Injection (SQLi)
Suppose we wrote a query by directly concatenating user input:
```javascript
// DANGEROUS BAD CODE:
const sql = "SELECT * FROM Users WHERE email = '" + email + "' AND password = '" + password + "'";
```
An attacker could enter `' OR '1'='1` into the email field. The resulting query becomes:
```sql
SELECT * FROM Users WHERE email = '' OR '1'='1' --' AND password = '...'
```
Since `'1'='1'` is always true, the query returns the first user in the database without checking any password!

### The Solution: Parameterized Queries (Prepared Statements)
In HireTrack, we use mysql2's parameterized queries with question mark (`?`) placeholders:
```javascript
const [rows] = await pool.query(
  'SELECT id, name, email, password FROM Users WHERE email = ?',
  [email]
);
```
**How it protects us**:
The database engine compiles and parses the SQL query template *before* inserting the parameters. Any user input passed inside the array is treated strictly as literal string data, NEVER as executable SQL code.

---

## 9. How Dashboard Statistics are Calculated

Instead of downloading thousands of rows to JavaScript and counting them in memory, HireTrack lets MySQL do the heavy lifting using aggregate functions:

1. **Total Count**:
   ```sql
   SELECT COUNT(*) AS total FROM Applications WHERE user_id = ?
   ```
2. **Status Breakdown using GROUP BY**:
   ```sql
   SELECT status, COUNT(*) AS count
   FROM Applications
   WHERE user_id = ?
   GROUP BY status
   ```
3. **Five Recent Applications using ORDER BY and LIMIT**:
   ```sql
   SELECT id, company_name, job_title, status, application_date
   FROM Applications
   WHERE user_id = ?
   ORDER BY application_date DESC, id DESC
   LIMIT 5
   ```
4. **User Summary using LEFT JOIN**:
   ```sql
   SELECT u.name, u.email, COUNT(a.id) AS total_apps
   FROM Users u
   LEFT JOIN Applications a ON u.id = a.user_id
   WHERE u.id = ?
   GROUP BY u.id, u.name, u.email
   ```

---

## 10. The Most Important SQL Queries Used in the Project

### 1. Filtering with Search and Conditions:
```sql
SELECT * FROM Applications 
WHERE user_id = ? 
  AND (company_name LIKE ? OR job_title LIKE ?) 
  AND status = ?
ORDER BY application_date DESC
LIMIT 10 OFFSET 0;
```

### 2. Updating Application with Ownership Verification:
```sql
UPDATE Applications 
SET company_name = ?, job_title = ?, status = ?, notes = ?
WHERE id = ? AND user_id = ?;
```

### 3. Deleting an Application:
```sql
DELETE FROM Applications 
WHERE id = ? AND user_id = ?;
```

---

## 11. 25+ Likely Placement Interview Questions & Answers

### General Web & Architecture:
**Q1: What is the difference between client-side routing and server-side routing?**
> In server-side routing, clicking a link requests a completely new HTML page from the server, causing a full page reload. In client-side routing (like React Router DOM), JavaScript intercepts URL changes and swaps out components in the DOM dynamically without reloading the page, providing a faster, app-like experience.

**Q2: What is a REST API?**
> REST (Representational State Transfer) is an architectural style for web services. It uses standard HTTP methods (`GET` to read, `POST` to create, `PUT` to update, `DELETE` to remove) and stateless communication, exchanging data typically in JSON format.

**Q3: What does CORS stand for, and why is it needed?**
> CORS stands for Cross-Origin Resource Sharing. Browsers enforce a security policy (Same-Origin Policy) preventing JavaScript on `http://localhost:5173` from accessing an API on `http://localhost:5000` unless the backend explicitly allows it via CORS HTTP headers.

**Q4: What is the difference between synchronous and asynchronous code in Node.js?**
> Synchronous code blocks the execution thread until an operation finishes. Asynchronous code (using Promises or `async/await`) offloads I/O tasks (like database queries or file reading) to the libuv event loop and calls back when complete, allowing Node.js to handle thousands of concurrent requests on a single thread.

**Q5: What are HTTP Status Codes? Give examples used in your project.**
> - `200 OK`: Request succeeded (e.g. fetching applications).
> - `201 Created`: New resource successfully created (e.g. register or create application).
> - `400 Bad Request`: Validation failure (e.g. missing required field).
> - `401 Unauthorized`: Missing or invalid authentication token.
> - `404 Not Found`: Resource does not exist or user doesn't have access.
> - `500 Internal Server Error`: Unexpected database or server crash.

---

### React & Frontend:
**Q6: What is the Virtual DOM and how does React use it?**
> The Virtual DOM is a lightweight JavaScript representation of the actual browser DOM. When component state changes, React updates the Virtual DOM, compares it with the previous snapshot (a process called "diffing" or reconciliation), and efficiently applies only the necessary changes to the real DOM.

**Q7: What is the difference between `props` and `state` in React?**
> `props` are read-only properties passed down from a parent component to configure a child. `state` is internal, mutable data managed by the component itself (via `useState`) that triggers a re-render when modified.

**Q8: Why do we use `useEffect` in React?**
> `useEffect` performs side-effects in functional components, such as fetching data from an API, subscribing to events, or manipulating timers. It accepts a dependency array to control when it re-executes.

**Q9: What is the purpose of Axios Interceptors in your project?**
> In HireTrack, we use a request interceptor to automatically attach the JWT Bearer token to the `Authorization` header of every outgoing API request. We also use a response interceptor to detect 401 errors globally and log out the user if their token expires.

**Q10: What is React Context and why did you choose it over Redux?**
> React Context provides a way to share state globally across components without manual prop-drilling. For HireTrack, React Context is lightweight, built directly into React, and eliminates the unnecessary boilerplate and bundle overhead of Redux.

---

### Node.js & Express:
**Q11: What is Express middleware?**
> Middleware functions in Express have access to `req`, `res`, and the `next` function. They can execute code, modify request/response objects, end the request cycle, or call `next()` to pass control to the next handler. Examples: `express.json()`, `cors()`, and our custom `authMiddleware`.

**Q12: Why did you use `bcryptjs` instead of plain SHA-256 for password hashing?**
> Plain hashing functions like SHA-256 are designed to be fast, making them vulnerable to brute-force and rainbow table attacks. `bcrypt` incorporates a cryptographic "salt" (random string) and is intentionally computationally intensive (adaptive cost factor), making dictionary attacks practically impossible.

**Q13: Why is it bad practice to store plain text passwords in a database?**
> If the database is compromised, leaked, or exposed through a backup error, all user credentials would be directly visible to attackers. Hashing ensures even database administrators cannot read user passwords.

**Q14: How does Node.js handle multiple requests with a single thread?**
> Node.js uses an event-driven, non-blocking I/O model powered by the `libuv` event loop. While JavaScript execution runs on a single main thread, time-consuming operations (like network calls and database queries) are handled asynchronously by background worker threads.

---

### MySQL & Database:
**Q15: What is the difference between SQL and NoSQL databases?**
> SQL databases (like MySQL) are relational, use structured tables with predefined schemas, enforce ACID transactions, and excel at complex relationships. NoSQL databases (like MongoDB) are document-oriented, schema-flexible, and store unstructured JSON-like data. For a job application tracker with users and applications, a relational database is ideal because of strict relations.

**Q16: Why use a Connection Pool (`createPool`) instead of `createConnection`?**
> Opening and closing a TCP socket to MySQL for every HTTP request is slow and exhausts system resources. A connection pool keeps a set of active connections open. When a query needs to run, it borrows a connection from the pool, executes the query, and releases it back for the next request.

**Q17: What is an Index in MySQL and why did you add indexes in your schema?**
> An index is a data structure (typically a B-tree) that allows MySQL to locate rows rapidly without scanning the entire table. In HireTrack, we added indexes on `user_id`, `status`, and `application_date` to accelerate queries that filter applications by user, status, or date.

**Q18: What is the difference between `WHERE` and `HAVING` in SQL?**
> `WHERE` filters individual rows *before* grouping or aggregation. `HAVING` filters aggregated groups *after* a `GROUP BY` clause has been executed.

**Q19: Explain the difference between `INNER JOIN` and `LEFT JOIN`.**
> `INNER JOIN` returns only rows where there is a match in both tables. `LEFT JOIN` returns all rows from the left table, and matching rows from the right table; if there is no match, the right side returns `NULL`.

**Q20: What is database normalization?**
> Normalization is the process of organizing database tables to reduce data redundancy and improve data integrity (e.g., 1NF, 2NF, 3NF). In HireTrack, user data is stored in the `Users` table and referenced by `user_id` in `Applications`, avoiding repeating user names and emails across every application row.

---

### Security & Placement Scenarios:
**Q21: How do you prevent SQL Injection in Node.js?**
> By using parameterized queries (placeholders `?`). The query template is compiled first, and parameters are passed separately as literal data, preventing malicious SQL strings from altering the query structure.

**Q22: How do you prevent a user from deleting someone else's application?**
> We enforce ownership at the database query level on the backend:
> `DELETE FROM Applications WHERE id = ? AND user_id = ?;`
> Even if a malicious user alters the ID in their browser, the query fails to affect any rows because `user_id` is matched against the authenticated JWT user.

**Q23: What are Environment Variables (`.env`) and why are they important?**
> Environment variables keep sensitive configuration data (database passwords, JWT secret keys, API ports) outside the codebase. This prevents accidental commits of secrets to public GitHub repositories and allows different configurations across development, staging, and production.

**Q24: What is the purpose of `ON DELETE CASCADE` on a foreign key?**
> It guarantees referential integrity. When a parent record (a user) is deleted, all dependent child records (their applications) are automatically deleted by the database engine, avoiding orphan records.

**Q25: If this application had 100,000 users, what improvements would you make?**
> 1. Add database indexing on frequently filtered columns (already done in HireTrack).
> 2. Implement Redis caching for frequent reads like job listings and dashboard counts.
> 3. Add rate limiting (e.g. `express-rate-limit`) on login and registration to mitigate brute-force attempts.
> 4. Use connection pool optimization and read-replicas for database queries.

---

## 12. 5 Coding Tasks to Practice Rewriting Without Notes

Practice rewriting these 5 core snippets on a whiteboard or blank code editor before your interviews:

### Task 1: Write the Express JWT Authentication Middleware
```javascript
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user to request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
```

---

### Task 2: Write User Registration with bcryptjs and mysql2
```javascript
async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields required' });
  }

  // 1. Check existing
  const [existing] = await pool.query('SELECT id FROM Users WHERE email = ?', [email]);
  if (existing.length > 0) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Insert user
  const [result] = await pool.query(
    'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)',
    [name, email, hashedPassword]
  );

  res.status(201).json({ success: true, userId: result.insertId });
}
```

---

### Task 3: Write the Secure Delete Application Controller
```javascript
async function deleteApplication(req, res) {
  const userId = req.user.id; // From JWT
  const { id } = req.params;

  // Notice the compound WHERE clause
  const [result] = await pool.query(
    'DELETE FROM Applications WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Application not found or unauthorized' });
  }

  res.status(200).json({ success: true, message: 'Deleted successfully' });
}
```

---

### Task 4: Write the ProtectedRoute Component in React
```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}
```

---

### Task 5: Write the Dashboard Stats SQL Query in Controller
```javascript
async function getDashboardStats(req, res) {
  const userId = req.user.id;

  const [totalRows] = await pool.query(
    'SELECT COUNT(*) AS total FROM Applications WHERE user_id = ?',
    [userId]
  );

  const [statusRows] = await pool.query(
    `SELECT status, COUNT(*) AS count 
     FROM Applications 
     WHERE user_id = ? 
     GROUP BY status`,
    [userId]
  );

  res.status(200).json({
    total: totalRows[0].total,
    statusBreakdown: statusRows
  });
}
```
