import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { staticPlugin } from '@elysiajs/static';
import { jwt } from '@elysiajs/jwt';
import { cookie } from '@elysiajs/cookie';
import { auth, validateUser, requireRole } from './middleware/auth';
import DB from './database/db';
import { randomUUID } from 'crypto';
import type { Student, Guardian, Attendance, AcademicRecord, User, LoginResponse } from './types';

interface JWTPayload {
    id: string;
    username: string;
    role: string;
}

type JWTContext = {
    jwt: {
        sign: (payload: JWTPayload) => Promise<string>;
        verify: (token: string) => Promise<JWTPayload | null>;
    };
};

const app = new Elysia()
    .use(cors())
    .use(swagger())
    .use(staticPlugin())
    .use(jwt({
        name: 'jwt',
        secret: process.env.JWT_SECRET || 'your-secret-key'
    }))
    .use(cookie())
    .use(auth)
    .get("/", () => Bun.file("public/index.html"))
    
    // Authentication
    .post("/login", async ({ body, jwt }: { body: { username: string; password: string; }; } & JWTContext): Promise<LoginResponse> => {
        try {
            const user = await validateUser(body.username, body.password);
            const token = await jwt.sign({
                id: user.id,
                username: user.username,
                role: user.role
            });
            
            return {
                token,
                user: {
                    username: user.username,
                    role: user.role
                }
            };
        } catch (error) {
            throw new Error('Invalid credentials');
        }
    })

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
            })
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
            })
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
            })
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
            })
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
            })
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
    })

    .listen(3000);

console.log(`🦊 Server is running at ${app.server?.hostname}:${app.server?.port}`);
