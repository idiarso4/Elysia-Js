import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { Database } from 'sqlite3';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';

const db = new Database('student_data.db');
const JWT_SECRET = 'your-super-secret-key';

interface User {
    id: string;
    username: string;
    password: string;
    role: string;
    name: string;
    email: string;
    nip: string;
}

interface LoginRequest {
    username: string;
    password: string;
}

interface LoginResponse {
    token: string;
    user: Omit<User, 'password'>;
}

interface ErrorResponse {
    message: string;
}

const app = new Elysia()
    .use(cors({
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
    }))
    .use(swagger())
    .post('/api/auth/login', async ({ body }: { body: LoginRequest }): Promise<{ status: number; body: LoginResponse | ErrorResponse }> => {
        const { username, password } = body;

        return new Promise((resolve) => {
            db.get<User>(
                'SELECT * FROM users WHERE username = ?',
                [username],
                async (err, user) => {
                    if (err) {
                        resolve({
                            status: 500,
                            body: { message: 'Internal server error' }
                        });
                        return;
                    }

                    if (!user) {
                        resolve({
                            status: 401,
                            body: { message: 'Username atau password salah' }
                        });
                        return;
                    }

                    try {
                        const validPassword = await bcrypt.compare(password, user.password);
                        if (!validPassword) {
                            resolve({
                                status: 401,
                                body: { message: 'Username atau password salah' }
                            });
                            return;
                        }

                        // Generate JWT token
                        const token = jwt.sign(
                            {
                                id: user.id,
                                username: user.username,
                                role: user.role,
                            },
                            JWT_SECRET,
                            { expiresIn: '24h' }
                        );

                        const { password: _, ...userWithoutPassword } = user;

                        resolve({
                            status: 200,
                            body: {
                                token,
                                user: userWithoutPassword
                            }
                        });
                    } catch (error) {
                        resolve({
                            status: 500,
                            body: { message: 'Internal server error' }
                        });
                    }
                }
            );
        });
    })
    .get('/', () => 'Student Management System API');

// Create HTTP server
const server = createServer(async (req, res) => {
    const response = await app.fetch(req.url || '', {
        method: req.method,
        headers: req.headers,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
    });

    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
        res.setHeader(key, value);
    });

    res.end(await response.text());
});

// Start server
server.listen(3001, () => {
    console.log('🦊 Student Management System is running at http://localhost:3001');
});
