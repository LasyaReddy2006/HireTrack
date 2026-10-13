# HireTrack — Job Application Tracker

A full-stack placement and job application management platform designed for CSE students to track campus applications, interviews, offers, and rejections in one central dashboard.

Built with **React.js (Vite)**, **Node.js**, **Express.js**, and **MySQL**, adhering strictly to modern software engineering best practices, security standards, and placement interview principles.

---

## 🌟 Key Features

- **User Authentication**: Secure signup and login using `bcryptjs` password hashing and stateless `jsonwebtoken` (JWT).
- **Strict Data Privacy**: Backend enforces that logged-in students can only view, create, edit, and delete their own job applications.
- **Full CRUD Application Tracking**: Track company name, job title, location, employment type, application date, salary/package, job post URL, and interview notes.
- **Search, Filter & Sorting**: Search by company or role, filter by status (`Applied`, `Interview`, `Offer`, `Rejected`, `Withdrawn`) or job type, and sort by date or company name.
- **Real-Time Dashboard**: Dynamic statistics computed directly from MySQL database queries using `COUNT`, `GROUP BY`, and `ORDER BY`.
- **Sample Campus Job Listings**: Curated placement openings that students can browse and add straight into their tracker with one click.
- **Student Profile Management**: View placement metrics, edit display name, and securely update password.
- **Clean SaaS UI**: Modern, light-themed aesthetic with tasteful blue accents, responsive sidebar and top navigation, status badges, and confirmation dialogs.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router DOM v7, Axios, Plain Vanilla CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL 8.0+ |
| **Database Driver** | `mysql2` (with Connection Pooling & Promises) |
| **Security** | `bcryptjs` (Password Hashing), `jsonwebtoken` (JWT Auth) |
| **Config** | `dotenv` (Environment Variables) |

> **Note**: No MongoDB, TypeScript, Redux, Next.js, Prisma, Sequelize, or Socket.IO are used. The logic is kept clean, beginner-friendly, and easy to explain during placement interviews.

---

## 📁 Project Directory Structure

```text
Hiretracker/
├── database/
│   └── schema.sql                # Complete MySQL DDL & DML statements with sample data
├── server/
│   ├── config/
│   │   ├── db.js                 # mysql2 connection pool configuration
│   │   ├── init-db.js            # Automated schema import script
│   │   └── test-db.js            # Database connection verification script
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Current User
│   │   ├── applicationController.js # CRUD, Search, Filter, Dashboard Stats
│   │   ├── jobController.js      # Sample Job Listings & 1-Click Track
│   │   └── profileController.js  # User Profile & Password Update
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT Bearer verification middleware
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── applicationRoutes.js  # /api/applications routes
│   │   ├── jobRoutes.js          # /api/jobs routes
│   │   └── profileRoutes.js      # /api/profile routes
│   ├── server.js                 # Express application entry point
│   ├── .env.example              # Backend environment template
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/           # Reusable UI (Sidebar, Navbar, Badge, Modal, etc.)
│   │   ├── context/              # AuthContext for global login state
│   │   ├── pages/                # 8 Application Pages (Dashboard, Applications, etc.)
│   │   ├── services/             # Axios API client functions
│   │   ├── App.jsx               # React Router configuration
│   │   ├── main.jsx              # React DOM entry point
│   │   └── index.css             # Vanilla CSS design system
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example              # Frontend environment template
│   └── package.json
├── INTERVIEW_PREPARATION.md      # Comprehensive interview guide with 25+ Q&As
├── README.md
└── package.json
```

---

## 🚀 Step-by-Step Setup Instructions

### Step 1: Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher) — [Download Node.js](https://nodejs.org/)
- **MySQL Server 8.0+** — [Download MySQL Community Server](https://dev.mysql.com/downloads/mysql/)

---

### Step 2: Configure the MySQL Database

1. **Verify MySQL is running**:
   - On Windows: Open **Services** and check that `MySQL80` is running.
2. **Set your MySQL password in `server/.env`**:
   - Navigate to the `server/` directory.
   - Open `server/.env` and update your MySQL password:
     ```env
     PORT=5000
     CLIENT_URL=http://localhost:5173
     DB_HOST=localhost
     DB_PORT=3306
     DB_USER=root
     DB_PASSWORD=your_actual_mysql_password_here
     DB_NAME=hiretrack
     JWT_SECRET=super_secret_hiretrack_key_replace_in_production
     JWT_EXPIRES_IN=7d
     ```

3. **Initialize the Database & Tables**:
   You can initialize the database using either of the following two options:

   **Option A: Automatic (Recommended)**
   Run the automated database setup script from the project root:
   ```bash
   npm run init-db
   ```
   *(Or from the `server` directory: `npm run init-db`)*

   **Option B: Manual via MySQL Workbench or CLI**
   Open MySQL Workbench or your terminal and execute:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

4. **Verify Database Connectivity**:
   ```bash
   npm run test-db
   ```
   If successful, you will see a confirmation message and a table showing the created database tables (`Users`, `Applications`, `JobListings`).

---

### Step 3: Start the Backend Server

Open a terminal window and run:
```bash
cd server
npm run dev
```
The backend server will start at **`http://localhost:5000`**.

---

### Step 4: Start the Frontend Application

Open a second terminal window and run:
```bash
cd client
npm run dev
```
The Vite development server will start at **`http://localhost:5173`**.

Open your browser and navigate to:
👉 **`http://localhost:5173`**

---

## 📡 REST API Reference

All protected endpoints require the HTTP header:
`Authorization: Bearer <your_jwt_token>`

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new student account | Public |
| `POST` | `/api/auth/login` | Authenticate user and return JWT | Public |
| `GET` | `/api/auth/me` | Get current user info from token | Protected |

### 2. Applications (`/api/applications`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/applications/dashboard/stats` | Aggregate dashboard counts & metrics | Protected |
| `GET` | `/api/applications` | List applications (with search, filter, sort, page) | Protected |
| `GET` | `/api/applications/:id` | Get single application details | Protected |
| `POST` | `/api/applications` | Create a new job application | Protected |
| `PUT` | `/api/applications/:id` | Update an existing application | Protected |
| `DELETE` | `/api/applications/:id` | Delete an application | Protected |

### 3. Job Listings (`/api/jobs`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/jobs` | Browse sample placement openings with filters | Public |
| `GET` | `/api/jobs/:id` | Get details of a single listing | Public |
| `POST` | `/api/jobs/:id/track` | Add a listing directly to user's tracker | Protected |

### 4. Profile (`/api/profile`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profile` | Get student profile & placement counts | Protected |
| `PUT` | `/api/profile` | Update profile name or password | Protected |

---

## 🔒 Security Practices Implemented

1. **Password Hashing with bcryptjs**: Passwords are never stored in plaintext. They are salted and hashed using 10 rounds of bcrypt.
2. **SQL Injection Prevention**: All queries use mysql2 parameterized statements (`?` placeholders). User input is never concatenated into SQL strings.
3. **JWT Stateless Authentication**: API endpoints verify token validity and expiration cryptographically before executing controller logic.
4. **Backend-Enforced Authorization**: Users can only query or mutate rows where `user_id = req.user.id`.
5. **CORS Security**: Cross-Origin requests are restricted to the configured client origin (`http://localhost:5173`).
6. **Separation of Secrets**: Secrets like `JWT_SECRET` and `DB_PASSWORD` are loaded exclusively from `.env`.

---

## 🎓 Placement Interview Preparation

Looking to ace your placement interviews with this project?
Check out the dedicated [INTERVIEW_PREPARATION.md](file:///c:/Users/lasya/OneDrive/Desktop/Hiretracker/INTERVIEW_PREPARATION.md) guide!

It covers:
- System Architecture and Request Lifecycles
- Detailed explanations of Foreign Keys and Cascading Deletes
- Why Connection Pooling matters
- Parameterized Queries vs. SQL Injection
- **25+ Real Placement Technical Interview Questions with Answers**
- **5 Practice Coding Tasks to rewrite from scratch**

---

## 📄 License
This project is open-source and free to use for student academic portfolios and placement preparation.
