import { Database } from 'sqlite3';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const db = new Database('student_data.db');

interface User {
    id: string;
    username: string;
    password: string;
    role: 'admin' | 'teacher' | 'staff';
    name: string;
    email: string;
    nip: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

interface CreateUserDTO {
    username: string;
    password: string;
    role: 'admin' | 'teacher' | 'staff';
    name: string;
    email: string;
    nip: string;
}

interface UpdateUserDTO {
    name?: string;
    email?: string;
    nip?: string;
    status?: 'active' | 'inactive';
    password?: string;
}

export const usersController = {
    // Get all users
    getUsers: () => {
        return new Promise<User[]>((resolve, reject) => {
            db.all<User>(
                `SELECT id, username, role, name, email, nip, status, createdAt, updatedAt 
                 FROM users 
                 ORDER BY createdAt DESC`,
                (err, users) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(users);
                }
            );
        });
    },

    // Get user by ID
    getUserById: (id: string) => {
        return new Promise<User | null>((resolve, reject) => {
            db.get<User>(
                `SELECT id, username, role, name, email, nip, status, createdAt, updatedAt 
                 FROM users 
                 WHERE id = ?`,
                [id],
                (err, user) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(user || null);
                }
            );
        });
    },

    // Create new user
    createUser: async (data: CreateUserDTO) => {
        // Check if username already exists
        const existingUser = await new Promise<User | null>((resolve, reject) => {
            db.get<User>(
                'SELECT * FROM users WHERE username = ?',
                [data.username],
                (err, user) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(user || null);
                }
            );
        });

        if (existingUser) {
            throw new Error('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const id = randomUUID();
        const now = new Date().toISOString();

        return new Promise<string>((resolve, reject) => {
            db.run(
                `INSERT INTO users (id, username, password, role, name, email, nip, status, createdAt, updatedAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
                [id, data.username, hashedPassword, data.role, data.name, data.email, data.nip, now, now],
                (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(id);
                }
            );
        });
    },

    // Update user
    updateUser: async (id: string, data: UpdateUserDTO) => {
        const user = await usersController.getUserById(id);
        if (!user) {
            throw new Error('User not found');
        }

        const updates: string[] = [];
        const values: any[] = [];

        if (data.name) {
            updates.push('name = ?');
            values.push(data.name);
        }

        if (data.email) {
            updates.push('email = ?');
            values.push(data.email);
        }

        if (data.nip) {
            updates.push('nip = ?');
            values.push(data.nip);
        }

        if (data.status) {
            updates.push('status = ?');
            values.push(data.status);
        }

        if (data.password) {
            updates.push('password = ?');
            values.push(await bcrypt.hash(data.password, 10));
        }

        updates.push('updatedAt = ?');
        values.push(new Date().toISOString());

        values.push(id);

        return new Promise<void>((resolve, reject) => {
            db.run(
                `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
                values,
                (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                }
            );
        });
    },

    // Delete user
    deleteUser: async (id: string) => {
        const user = await usersController.getUserById(id);
        if (!user) {
            throw new Error('User not found');
        }

        return new Promise<void>((resolve, reject) => {
            db.run(
                'DELETE FROM users WHERE id = ?',
                [id],
                (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                }
            );
        });
    }
};
