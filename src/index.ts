import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { staticPlugin } from '@elysiajs/static';
import { auth, validateUser, requireRole } from './middleware/auth';
import DB from './database/db';
import { randomUUID } from 'crypto';

const app = new Elysia()
    .use(cors())
    .use(swagger())
    .use(staticPlugin())
    .use(auth)
    .get("/", () => Bun.file("public/index.html"))
    
    // Authentication
    .post("/login", async ({ body, jwt }) => {
        const { username, password } = body as any;
        
        try {
            const user = await validateUser(username, password);
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
    
    // Get students with pagination
    .get("/students", async ({ query }) => {
        const page = parseInt(query?.page as string) || 1;
        const limit = parseInt(query?.limit as string) || 10;
        const offset = (page - 1) * limit;
        
        const students = await DB.query(
            `SELECT s.*, g.* 
             FROM students s 
             LEFT JOIN guardians g ON s.id = g.studentId
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        
        const total = await DB.get<{ count: number }>(
            'SELECT COUNT(*) as count FROM students'
        );
        
        return {
            students,
            pagination: {
                page,
                limit,
                total: total?.count || 0,
                pages: Math.ceil((total?.count || 0) / limit)
            }
        };
    }, { beforeHandle: [requireRole(['admin', 'teacher'])] })
    
    // Create student
    .post("/students", async ({ body }) => {
        const student = body as any;
        const now = new Date().toISOString();
        const studentId = randomUUID();
        
        await DB.run(
            `INSERT INTO students (id, name, age, grade, address, status, photo, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [studentId, student.name, student.age, student.grade, student.address, 
             student.status || 'active', student.photo, now, now]
        );
        
        if (student.guardian) {
            await DB.run(
                `INSERT INTO guardians (id, studentId, name, relationship, phone, email, address, createdAt, updatedAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [randomUUID(), studentId, student.guardian.name, student.guardian.relationship,
                 student.guardian.phone, student.guardian.email, student.guardian.address, now, now]
            );
        }
        
        return {
            message: "Student created successfully",
            studentId
        };
    }, { beforeHandle: [requireRole(['admin'])] })
    
    // Update student
    .put("/students/:id", async ({ params: { id }, body }) => {
        const student = body as any;
        const now = new Date().toISOString();
        
        await DB.run(
            `UPDATE students 
             SET name = ?, age = ?, grade = ?, address = ?, status = ?, 
                 photo = ?, updatedAt = ?
             WHERE id = ?`,
            [student.name, student.age, student.grade, student.address,
             student.status, student.photo, now, id]
        );
        
        if (student.guardian) {
            await DB.run(
                `UPDATE guardians 
                 SET name = ?, relationship = ?, phone = ?, email = ?, 
                     address = ?, updatedAt = ?
                 WHERE studentId = ?`,
                [student.guardian.name, student.guardian.relationship,
                 student.guardian.phone, student.guardian.email,
                 student.guardian.address, now, id]
            );
        }
        
        return {
            message: "Student updated successfully"
        };
    }, { beforeHandle: [requireRole(['admin'])] })
    
    // Delete student
    .delete("/students/:id", async ({ params: { id } }) => {
        await DB.run('DELETE FROM students WHERE id = ?', [id]);
        return {
            message: "Student deleted successfully"
        };
    }, { beforeHandle: [requireRole(['admin'])] })
    
    // Record attendance
    .post("/students/:id/attendance", async ({ params: { id }, body }) => {
        const attendance = body as any;
        const now = new Date().toISOString();
        
        await DB.run(
            `INSERT INTO attendance (id, studentId, date, status, note, createdAt)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [randomUUID(), id, attendance.date, attendance.status,
             attendance.note, now]
        );
        
        return {
            message: "Attendance recorded successfully"
        };
    }, { beforeHandle: [requireRole(['admin', 'teacher'])] })
    
    // Add academic record
    .post("/students/:id/academic", async ({ params: { id }, body }) => {
        const record = body as any;
        const now = new Date().toISOString();
        
        await DB.run(
            `INSERT INTO academic_records (id, studentId, subject, score, term, year,
                                         teacher, comments, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [randomUUID(), id, record.subject, record.score, record.term,
             record.year, record.teacher, record.comments, now]
        );
        
        return {
            message: "Academic record added successfully"
        };
    }, { beforeHandle: [requireRole(['admin', 'teacher'])] })
    
    // Get student timeline
    .get("/students/:id/timeline", async ({ params: { id } }) => {
        const [attendance, academic, communications, documents] = await Promise.all([
            DB.query('SELECT * FROM attendance WHERE studentId = ? ORDER BY date DESC', [id]),
            DB.query('SELECT * FROM academic_records WHERE studentId = ? ORDER BY createdAt DESC', [id]),
            DB.query('SELECT * FROM communications WHERE studentId = ? ORDER BY createdAt DESC', [id]),
            DB.query('SELECT * FROM documents WHERE studentId = ? ORDER BY uploadedAt DESC', [id])
        ]);
        
        const timeline = [
            ...attendance.map(record => ({
                type: 'attendance',
                date: record.date,
                title: `Attendance: ${record.status}`,
                details: record
            })),
            ...academic.map(record => ({
                type: 'academic',
                date: `${record.year}-${record.term}`,
                title: `${record.subject} Score: ${record.score}%`,
                details: record
            })),
            ...communications.map(comm => ({
                type: 'communication',
                date: comm.sentAt || comm.createdAt,
                title: comm.subject,
                details: comm
            })),
            ...documents.map(doc => ({
                type: 'document',
                date: doc.uploadedAt,
                title: doc.name,
                details: doc
            }))
        ];
        
        timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        return timeline;
    }, { beforeHandle: [requireRole(['admin', 'teacher'])] })
    
    .listen(3000);

console.log(`🦊 Server is running at ${app.server?.hostname}:${app.server?.port}`);
