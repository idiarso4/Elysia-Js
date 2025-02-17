import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { staticPlugin } from '@elysiajs/static';
import { jwt } from '@elysiajs/jwt';
import { cookie } from '@elysiajs/cookie';
import { auth, validateUser, requireRole, AuthError, ValidationError } from './middleware/auth';
import DB from './database/db';
import { randomUUID } from 'crypto';
import type { Student, Guardian, Attendance, AcademicRecord, User, LoginResponse } from './types';

interface JWTPayload extends Record<string, string | number> {
    id: string;
    username: string;
    role: 'admin' | 'teacher' | 'staff';
    iat?: number;
    exp?: number;
}

const app = new Elysia()
    .use(cors())
    .use(swagger({
        documentation: {
            info: {
                title: 'Student Management System API',
                version: '1.0.0',
                description: 'API for managing student data, attendance, and academic records',
                contact: {
                    name: 'API Support',
                    email: 'support@example.com'
                }
            },
            tags: [
                { name: 'auth', description: 'Authentication endpoints' },
                { name: 'students', description: 'Student management endpoints' },
                { name: 'guardians', description: 'Guardian management endpoints' },
                { name: 'attendance', description: 'Attendance tracking endpoints' },
                { name: 'academics', description: 'Academic records endpoints' }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            }
        }
    }))
    .use(staticPlugin())
    .use(jwt({
        name: 'jwt',
        secret: process.env.JWT_SECRET || 'your-secret-key',
        exp: '7d'
    }))
    .use(cookie())
    .use(auth)
    .onError(({ code, error, set }) => {
        if (error instanceof AuthError || error instanceof ValidationError) {
            set.status = error.status;
            return {
                error: error.message,
                code: error.status
            };
        }
        
        // Default error handling
        set.status = code === 'NOT_FOUND' ? 404 : 500;
        return {
            error: error.message,
            code: set.status
        };
    })
    .get("/", () => Bun.file("public/index.html"))
    
    // Authentication
    .post("/login", 
        async ({ body, jwt }) => {
            const { username, password } = body as { username: string; password: string };
            
            try {
                const user = await validateUser(username, password);
                const payload: JWTPayload = {
                    id: user.id,
                    username: user.username,
                    role: user.role as 'admin' | 'teacher' | 'staff'
                };
                
                const token = await jwt.sign(payload);
                
                return {
                    token,
                    user: {
                        username: user.username,
                        role: user.role
                    }
                } satisfies LoginResponse;
            } catch (error) {
                if (error instanceof ValidationError) {
                    throw error;
                }
                throw new AuthError('Authentication failed');
            }
        },
        {
            body: t.Object({
                username: t.String({ minLength: 3, description: 'User login username' }),
                password: t.String({ minLength: 6, description: 'User login password' })
            }),
            detail: {
                tags: ['auth'],
                summary: 'Login to the system',
                description: 'Authenticate user and get JWT token',
                responses: {
                    '200': {
                        description: 'Successfully authenticated',
                        content: {
                            'application/json': {
                                schema: t.Object({
                                    token: t.String(),
                                    user: t.Object({
                                        username: t.String(),
                                        role: t.String()
                                    })
                                })
                            }
                        }
                    },
                    '400': {
                        description: 'Validation error',
                        content: {
                            'application/json': {
                                schema: t.Object({
                                    error: t.String(),
                                    code: t.Number()
                                })
                            }
                        }
                    },
                    '401': {
                        description: 'Authentication failed',
                        content: {
                            'application/json': {
                                schema: t.Object({
                                    error: t.String(),
                                    code: t.Number()
                                })
                            }
                        }
                    }
                }
            }
        }
    )

    // Guardian Management
    .post("/students/:studentId/guardians",
        async ({ params: { studentId }, body, set }) => {
            const guardian = body as Omit<Guardian, 'id' | 'createdAt' | 'updatedAt'>;
            const id = randomUUID();
            const now = new Date().toISOString();

            try {
                await DB.run(
                    `INSERT INTO guardians (id, studentId, name, relationship, phone, email, address, createdAt, updatedAt)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [id, studentId, guardian.name, guardian.relationship, guardian.phone,
                     guardian.email || null, guardian.address, now, now]
                );

                return { message: "Guardian added successfully", id };
            } catch (error) {
                set.status = 400;
                return { error: "Failed to add guardian" };
            }
        },
        {
            body: t.Object({
                name: t.String(),
                relationship: t.String(),
                phone: t.String(),
                email: t.Optional(t.String()),
                address: t.String()
            }),
            detail: {
                tags: ['guardians'],
                summary: 'Add a guardian to a student',
                description: 'Create a new guardian record for a student',
                responses: {
                    '200': {
                        description: 'Guardian added successfully',
                        content: {
                            'application/json': {
                                schema: t.Object({
                                    message: t.String(),
                                    id: t.String()
                                })
                            }
                        }
                    },
                    '400': {
                        description: 'Validation error',
                        content: {
                            'application/json': {
                                schema: t.Object({
                                    error: t.String(),
                                    code: t.Number()
                                })
                            }
                        }
                    }
                }
            }
        }
    )

    .get("/students/:studentId/guardians", async ({ params: { studentId } }): Promise<Guardian[]> => {
        try {
            const guardians = await DB.all<Guardian>(
                "SELECT * FROM guardians WHERE studentId = ?",
                [studentId]
            );
            return guardians;
        } catch (error) {
            return [];
        }
    },
    {
        detail: {
            tags: ['guardians'],
            summary: 'Get guardians of a student',
            description: 'Retrieve a list of guardians for a student',
            responses: {
                '200': {
                    description: 'Guardians retrieved successfully',
                    content: {
                        'application/json': {
                            schema: t.Array(t.Object({
                                id: t.String(),
                                studentId: t.String(),
                                name: t.String(),
                                relationship: t.String(),
                                phone: t.String(),
                                email: t.Optional(t.String()),
                                address: t.String(),
                                createdAt: t.String(),
                                updatedAt: t.String()
                            }))
                        }
                    }
                }
            }
        }
    })

    // Attendance Management
    .post("/students/:studentId/attendance",
        async ({ params: { studentId }, body, set }) => {
            const attendance = body as Omit<Attendance, 'id' | 'studentId' | 'createdAt' | 'updatedAt'>;
            const id = randomUUID();
            const now = new Date().toISOString();

            try {
                await DB.run(
                    `INSERT INTO attendance (id, studentId, date, status, notes, createdAt, updatedAt)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [id, studentId, attendance.date, attendance.status,
                     attendance.notes || null, now, now]
                );

                return { message: "Attendance recorded successfully", id };
            } catch (error) {
                set.status = 400;
                return { error: "Failed to record attendance" };
            }
        },
        {
            body: t.Object({
                date: t.String(),
                status: t.Union([
                    t.Literal('present'),
                    t.Literal('absent'),
                    t.Literal('late'),
                    t.Literal('excused')
                ]),
                notes: t.Optional(t.String())
            }),
            detail: {
                tags: ['attendance'],
                summary: 'Record attendance for a student',
                description: 'Create a new attendance record for a student',
                responses: {
                    '200': {
                        description: 'Attendance recorded successfully',
                        content: {
                            'application/json': {
                                schema: t.Object({
                                    message: t.String(),
                                    id: t.String()
                                })
                            }
                        }
                    },
                    '400': {
                        description: 'Validation error',
                        content: {
                            'application/json': {
                                schema: t.Object({
                                    error: t.String(),
                                    code: t.Number()
                                })
                            }
                        }
                    }
                }
            }
        }
    )

    .get("/students/:studentId/attendance", async ({ params: { studentId }, query }): Promise<Attendance[]> => {
        const startDate = query?.startDate as string || '1970-01-01';
        const endDate = query?.endDate as string || '2100-12-31';

        try {
            const attendance = await DB.all<Attendance>(
                `SELECT * FROM attendance 
                 WHERE studentId = ? AND date BETWEEN ? AND ?
                 ORDER BY date DESC`,
                [studentId, startDate, endDate]
            );
            return attendance;
        } catch (error) {
            return [];
        }
    },
    {
        detail: {
            tags: ['attendance'],
            summary: 'Get attendance records of a student',
            description: 'Retrieve a list of attendance records for a student',
            responses: {
                '200': {
                    description: 'Attendance records retrieved successfully',
                    content: {
                        'application/json': {
                            schema: t.Array(t.Object({
                                id: t.String(),
                                studentId: t.String(),
                                date: t.String(),
                                status: t.Union([
                                    t.Literal('present'),
                                    t.Literal('absent'),
                                    t.Literal('late'),
                                    t.Literal('excused')
                                ]),
                                notes: t.Optional(t.String()),
                                createdAt: t.String(),
                                updatedAt: t.String()
                            }))
                        }
                    }
                }
            }
        }
    })

    // Academic Records Management
    .post("/students/:studentId/academics",
        async ({ params: { studentId }, body, set }) => {
            const record = body as Omit<AcademicRecord, 'id' | 'studentId' | 'createdAt' | 'updatedAt'>;
            const id = randomUUID();
            const now = new Date().toISOString();

            try {
                await DB.run(
                    `INSERT INTO academic_records (id, studentId, subject, semester, grade, notes, createdAt, updatedAt)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [id, studentId, record.subject, record.semester, record.grade,
                     record.notes || null, now, now]
                );

                return { message: "Academic record added successfully", id };
            } catch (error) {
                set.status = 400;
                return { error: "Failed to add academic record" };
            }
        },
        {
            body: t.Object({
                subject: t.String(),
                semester: t.String(),
                grade: t.Number(),
                notes: t.Optional(t.String())
            }),
            detail: {
                tags: ['academics'],
                summary: 'Add an academic record for a student',
                description: 'Create a new academic record for a student',
                responses: {
                    '200': {
                        description: 'Academic record added successfully',
                        content: {
                            'application/json': {
                                schema: t.Object({
                                    message: t.String(),
                                    id: t.String()
                                })
                            }
                        }
                    },
                    '400': {
                        description: 'Validation error',
                        content: {
                            'application/json': {
                                schema: t.Object({
                                    error: t.String(),
                                    code: t.Number()
                                })
                            }
                        }
                    }
                }
            }
        }
    )

    .get("/students/:studentId/academics", async ({ params: { studentId }, query }): Promise<AcademicRecord[]> => {
        const semester = query?.semester as string;
        const subject = query?.subject as string;

        try {
            let sql = "SELECT * FROM academic_records WHERE studentId = ?";
            const params: any[] = [studentId];

            if (semester) {
                sql += " AND semester = ?";
                params.push(semester);
            }
            if (subject) {
                sql += " AND subject = ?";
                params.push(subject);
            }

            sql += " ORDER BY createdAt DESC";

            const records = await DB.all<AcademicRecord>(sql, params);
            return records;
        } catch (error) {
            return [];
        }
    },
    {
        detail: {
            tags: ['academics'],
            summary: 'Get academic records of a student',
            description: 'Retrieve a list of academic records for a student',
            responses: {
                '200': {
                    description: 'Academic records retrieved successfully',
                    content: {
                        'application/json': {
                            schema: t.Array(t.Object({
                                id: t.String(),
                                studentId: t.String(),
                                subject: t.String(),
                                semester: t.String(),
                                grade: t.Number(),
                                notes: t.Optional(t.String()),
                                createdAt: t.String(),
                                updatedAt: t.String()
                            }))
                        }
                    }
                }
            }
        }
    })

    // Student Management
    .post("/students", 
        async ({ body, set }) => {
            const student = body as Omit<Student, 'id' | 'createdAt' | 'updatedAt'>;
            const id = randomUUID();
            const now = new Date().toISOString();

            try {
                const result = await DB.run(
                    `INSERT INTO students (id, name, age, grade, address, status, photo, createdAt, updatedAt)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [id, student.name, student.age, student.grade, student.address, 
                     student.status || 'active', student.photo || null, now, now]
                );

                return { message: "Student created successfully", id };
            } catch (error) {
                set.status = 400;
                return { error: "Failed to create student" };
            }
        },
        {
            body: t.Object({
                name: t.String(),
                age: t.Number(),
                grade: t.String(),
                address: t.String(),
                status: t.Optional(t.String()),
                photo: t.Optional(t.String())
            }),
            detail: {
                tags: ['students'],
                summary: 'Create a new student',
                description: 'Create a new student record',
                responses: {
                    '200': {
                        description: 'Student created successfully',
                        content: {
                            'application/json': {
                                schema: t.Object({
                                    message: t.String(),
                                    id: t.String()
                                })
                            }
                        }
                    },
                    '400': {
                        description: 'Validation error',
                        content: {
                            'application/json': {
                                schema: t.Object({
                                    error: t.String(),
                                    code: t.Number()
                                })
                            }
                        }
                    }
                }
            }
        }
    )

    .get("/students/:id", async ({ params: { id }, set }): Promise<Student | null> => {
        try {
            const student = await DB.get<Student>(
                "SELECT * FROM students WHERE id = ?",
                [id]
            );

            if (!student) {
                set.status = 404;
                return null;
            }

            return student;
        } catch (error) {
            set.status = 500;
            return null;
        }
    },
    {
        detail: {
            tags: ['students'],
            summary: 'Get a student by ID',
            description: 'Retrieve a student record by ID',
            responses: {
                '200': {
                    description: 'Student retrieved successfully',
                    content: {
                        'application/json': {
                            schema: t.Object({
                                id: t.String(),
                                name: t.String(),
                                age: t.Number(),
                                grade: t.String(),
                                address: t.String(),
                                status: t.String(),
                                photo: t.Optional(t.String()),
                                createdAt: t.String(),
                                updatedAt: t.String()
                            })
                        }
                    }
                },
                '404': {
                    description: 'Student not found',
                    content: {
                        'application/json': {
                            schema: t.Object({
                                error: t.String(),
                                code: t.Number()
                            })
                        }
                    }
                }
            }
        }
    })

    .get("/students", async ({ query }) => {
        const page = Number(query?.page) || 1;
        const limit = Number(query?.limit) || 10;
        const offset = (page - 1) * limit;
        const search = query?.search as string || '';

        try {
            const students = await DB.all<Student>(
                `SELECT * FROM students 
                 WHERE name LIKE ? OR grade LIKE ?
                 ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
                [`%${search}%`, `%${search}%`, limit, offset]
            );

            const totalResult = await DB.get<{ count: number }>(
                "SELECT COUNT(*) as count FROM students WHERE name LIKE ? OR grade LIKE ?",
                [`%${search}%`, `%${search}%`]
            );

            const total = totalResult?.count || 0;

            return {
                data: students,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            return { error: "Failed to fetch students" };
        }
    },
    {
        detail: {
            tags: ['students'],
            summary: 'Get a list of students',
            description: 'Retrieve a list of student records',
            responses: {
                '200': {
                    description: 'Students retrieved successfully',
                    content: {
                        'application/json': {
                            schema: t.Object({
                                data: t.Array(t.Object({
                                    id: t.String(),
                                    name: t.String(),
                                    age: t.Number(),
                                    grade: t.String(),
                                    address: t.String(),
                                    status: t.String(),
                                    photo: t.Optional(t.String()),
                                    createdAt: t.String(),
                                    updatedAt: t.String()
                                })),
                                pagination: t.Object({
                                    page: t.Number(),
                                    limit: t.Number(),
                                    total: t.Number(),
                                    totalPages: t.Number()
                                })
                            })
                        }
                    }
                }
            }
        }
    })

    .put("/students/:id", 
        async ({ params: { id }, body, set }) => {
            const student = body as Omit<Student, 'id' | 'createdAt' | 'updatedAt'>;
            const now = new Date().toISOString();

            try {
                const result = await DB.run(
                    `UPDATE students 
                     SET name = ?, age = ?, grade = ?, address = ?, 
                         status = ?, photo = ?, updatedAt = ?
                     WHERE id = ?`,
                    [student.name, student.age, student.grade, student.address,
                     student.status, student.photo, now, id]
                );

                if (!result.changes) {
                    set.status = 404;
                    return { error: "Student not found" };
                }

                return { message: "Student updated successfully" };
            } catch (error) {
                set.status = 400;
                return { error: "Failed to update student" };
            }
        },
        {
            body: t.Object({
                name: t.String(),
                age: t.Number(),
                grade: t.String(),
                address: t.String(),
                status: t.String(),
                photo: t.Optional(t.String())
            }),
            detail: {
                tags: ['students'],
                summary: 'Update a student',
                description: 'Update a student record',
                responses: {
                    '200': {
                        description: 'Student updated successfully',
                        content: {
                            'application/json': {
                                schema: t.Object({
                                    message: t.String()
                                })
                            }
                        }
                    },
                    '400': {
                        description: 'Validation error',
                        content: {
                            'application/json': {
                                schema: t.Object({
                                    error: t.String(),
                                    code: t.Number()
                                })
                            }
                        }
                    },
                    '404': {
                        description: 'Student not found',
                        content: {
                            'application/json': {
                                schema: t.Object({
                                    error: t.String(),
                                    code: t.Number()
                                })
                            }
                        }
                    }
                }
            }
        }
    )

    .delete("/students/:id", async ({ params: { id }, set }) => {
        try {
            const result = await DB.run(
                "DELETE FROM students WHERE id = ?",
                [id]
            );

            if (!result.changes) {
                set.status = 404;
                return { error: "Student not found" };
            }

            return { message: "Student deleted successfully" };
        } catch (error) {
            set.status = 500;
            return { error: "Failed to delete student" };
        }
    },
    {
        detail: {
            tags: ['students'],
            summary: 'Delete a student',
            description: 'Delete a student record',
            responses: {
                '200': {
                    description: 'Student deleted successfully',
                    content: {
                        'application/json': {
                            schema: t.Object({
                                message: t.String()
                            })
                        }
                    }
                },
                '404': {
                    description: 'Student not found',
                    content: {
                        'application/json': {
                            schema: t.Object({
                                error: t.String(),
                                code: t.Number()
                            })
                        }
                    }
                }
            }
        }
    })

    .listen(3000);

console.log(`🦊 Server is running at ${app.server?.hostname}:${app.server?.port}`);
