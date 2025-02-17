# Student Management System

A comprehensive student management system built with Elysia.js, featuring robust API endpoints for managing student data, attendance, and academic records.

## Features

- **Authentication & Authorization**
  - JWT-based authentication with role-based access
  - Secure password hashing with bcrypt
  - Role types: Admin, Teacher, Staff
  - Protected routes with middleware

- **Student Management**
  - Complete CRUD operations for student profiles
  - Pagination and search functionality
  - Photo management
  - Status tracking
  - Type-safe operations

- **Guardian Management**
  - Add and manage student guardians
  - Multiple guardians per student
  - Contact information tracking
  - Relationship management

- **Academic Records**
  - Track grades by subject and semester
  - Performance analytics
  - Notes and comments
  - Filtered queries

- **Attendance System**
  - Daily attendance tracking
  - Multiple status options (present/absent/late/excused)
  - Date range filtering
  - Notes for each record

## Technical Stack

- **Backend Framework**: Elysia.js with TypeScript
- **Database**: SQLite3
- **Authentication**: JWT (@elysiajs/jwt)
- **API Documentation**: Swagger/OpenAPI
- **Type Safety**: Full TypeScript support
- **Validation**: Runtime type checking
- **Error Handling**: Custom error classes with status codes

## API Documentation

The API is fully documented using Swagger/OpenAPI. Access the documentation at:
```
http://localhost:3000/swagger
```

### API Endpoints

#### Authentication
- `POST /login` - Authenticate user and get JWT token

#### Students
- `GET /students` - List students with pagination and search
- `GET /students/:id` - Get student details
- `POST /students` - Create new student
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student

#### Guardians
- `GET /students/:studentId/guardians` - List student's guardians
- `POST /students/:studentId/guardians` - Add guardian to student

#### Attendance
- `GET /students/:studentId/attendance` - Get attendance records
- `POST /students/:studentId/attendance` - Record attendance

#### Academic Records
- `GET /students/:studentId/academics` - Get academic records
- `POST /students/:studentId/academics` - Add academic record

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/student-management-system.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Run database migrations:
   ```bash
   npm run migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

- `JWT_SECRET` - Secret key for JWT token generation
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Error Handling

The API uses custom error classes for better error handling:

- `AuthError` - Authentication and authorization errors (401)
- `ValidationError` - Input validation errors (400)
- Generic errors - Server errors (500)

## Type Safety

The project uses TypeScript with strict type checking:

- Custom interfaces for all data models
- Type-safe database operations
- Runtime type validation
- JWT payload type validation

## Security Features

- JWT token expiration
- Password hashing with bcrypt
- Role-based access control
- Input validation
- SQL injection prevention
- Error message sanitization

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Elysia.js team for the excellent framework
- Contributors and maintainers
- Community feedback and support