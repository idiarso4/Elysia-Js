# Student Management System

A modern student management system built with Elysia.js and Next.js, featuring a beautiful Material UI dashboard.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin/Teacher)
  - Secure password hashing
  - Protected routes

- **Student Management**
  - Complete student profiles
  - Guardian information
  - Photo management
  - Status tracking

- **Academic Records**
  - Grade tracking
  - Performance analytics
  - Report generation
  - Progress monitoring

- **Attendance System**
  - Daily attendance tracking
  - Attendance reports
  - Status (Present/Absent/Late)
  - Notes and comments

- **Document Management**
  - Document upload
  - File categorization
  - Secure storage
  - Easy retrieval

- **Modern UI/UX**
  - Responsive design
  - Dark/Light mode
  - Material UI components
  - Interactive charts

## Screenshots

### Login Page
![Login Page](docs/images/login.png)

### Dashboard
![Dashboard](docs/images/dashboard.png)

### Student List
![Student List](docs/images/students.png)

### Student Details
![Student Details](docs/images/student-details.png)

## Tech Stack

### Backend
- Elysia.js - Fast Node.js web framework
- SQLite - Database
- JWT - Authentication
- bcrypt - Password hashing

### Frontend
- Next.js 14
- Material UI
- TypeScript
- Chart.js
- NextAuth.js

## Getting Started

### Prerequisites
- Node.js 18+
- Bun runtime

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/student-management-system.git
cd student-management-system
```

2. Install backend dependencies
```bash
cd backend
bun install
```

3. Run database migrations
```bash
bun run migrate
bun run seed
```

4. Install frontend dependencies
```bash
cd ../frontend/package
npm install
```

5. Start the development servers

Backend:
```bash
cd backend
bun run dev
```

Frontend:
```bash
cd frontend/package
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Default Login Credentials

```
Admin:
Username: admin
Password: admin123

Teacher:
Username: teacher
Password: teacher123
```

## Project Structure

```
.
├── backend/                 # Elysia.js backend
│   ├── src/
│   │   ├── database/       # Database configuration and migrations
│   │   ├── middleware/     # Authentication middleware
│   │   └── index.ts        # Main application file
│   └── package.json
│
└── frontend/               # Next.js frontend
    └── package/
        ├── public/         # Static files
        └── src/
            ├── app/        # Next.js 14 app directory
            │   ├── auth/   # Authentication pages
            │   └── (DashboardLayout)/
            │       └── students/  # Student management pages
            └── components/ # Reusable components
