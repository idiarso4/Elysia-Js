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

## API Documentation

### Authentication

#### Login
```http
POST /api/auth/login
```

Request body:
```json
{
    "username": "string",
    "password": "string"
}
```

Response:
```json
{
    "token": "string",
    "user": {
        "id": "string",
        "username": "string",
        "role": "admin" | "teacher" | "staff",
        "name": "string",
        "email": "string",
        "nip": "string"
    }
}
```

### User Management (Admin Only)

#### Get All Users
```http
GET /api/users
```
Headers:
```
Authorization: Bearer <token>
```

Response:
```json
[
    {
        "id": "string",
        "username": "string",
        "role": "admin" | "teacher" | "staff",
        "name": "string",
        "email": "string",
        "nip": "string",
        "status": "active" | "inactive"
    }
]
```

#### Get User by ID
```http
GET /api/users/:id
```
Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
    "id": "string",
    "username": "string",
    "role": "admin" | "teacher" | "staff",
    "name": "string",
    "email": "string",
    "nip": "string",
    "status": "active" | "inactive"
}
```

#### Create User
```http
POST /api/users
```
Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Request body:
```json
{
    "username": "string",
    "password": "string",
    "role": "admin" | "teacher" | "staff",
    "name": "string",
    "email": "string",
    "nip": "string"
}
```

Response:
```json
{
    "message": "User created successfully",
    "id": "string"
}
```

#### Update User
```http
PUT /api/users/:id
```
Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Request body:
```json
{
    "name": "string",
    "email": "string",
    "nip": "string",
    "status": "active" | "inactive",
    "password": "string" // Optional
}
```

Response:
```json
{
    "message": "User updated successfully"
}
```

#### Delete User
```http
DELETE /api/users/:id
```
Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
    "message": "User deleted successfully"
}
```

### Error Responses

All endpoints may return these error responses:

#### 401 Unauthorized
```json
{
    "message": "Invalid token"
}
```

#### 403 Forbidden
```json
{
    "message": "Forbidden: Admin access required"
}
```

#### 404 Not Found
```json
{
    "message": "Resource not found"
}
```

#### 500 Internal Server Error
```json
{
    "message": "Internal server error"
}
```

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