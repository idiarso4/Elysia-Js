import { Elysia } from 'elysia';
import bcrypt from 'bcrypt';
import DB from '../database/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-super-secret-key';

interface User {
    id: string;
    username: string;
    password: string;
    role: 'admin' | 'teacher' | 'staff';
    name: string;
    email: string;
}

export const authController = new Elysia({ prefix: '/api/auth' })
    .post('/login', async ({ body }) => {
        const { username, password } = body as { username: string; password: string };

        try {
            // Get user from database
            const user = await DB.get<User>(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );

            if (!user) {
                return {
                    status: 401,
                    body: { message: 'Invalid username or password' }
                };
            }

            // Verify password
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return {
                    status: 401,
                    body: { message: 'Invalid username or password' }
                };
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

            // Return user data and token
            return {
                status: 200,
                body: {
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        role: user.role,
                        name: user.name,
                        email: user.email,
                    }
                }
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                status: 500,
                body: { message: 'Internal server error' }
            };
        }
    });
