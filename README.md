# Student Management System

A modern student management system built with Elysia.js and Next.js.

## Project Structure

```
elysia/
├── backend/            # Backend (Elysia.js)
│   ├── src/
│   │   ├── controllers/
│   │   ├── database/
│   │   └── index.ts
│   └── package.json
├── frontend/          # Frontend (Next.js)
│   ├── src/
│   │   ├── app/
│   │   └── components/
│   └── package.json
└── README.md
```

## Features

- Modern landing page
- Authentication system
- Student management
- Class management
- Academic records
- Attendance tracking
- Role-based access control

## Tech Stack

### Backend
- Elysia.js
- TypeScript
- SQLite3
- JWT Authentication

### Frontend
- Next.js 14
- Material UI
- TypeScript
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/idiarso4/Elysia-Js.git
cd Elysia-Js
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Development

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## License

This project is licensed under the MIT License.