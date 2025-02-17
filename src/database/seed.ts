import { Database } from 'sqlite3';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const db = new Database('student_data.db');

// Sample data
const users = [
    {
        id: randomUUID(),
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        name: 'Administrator',
        email: 'admin@school.com',
        nip: 'ADM001',
        phone: '081234567890'
    },
    {
        id: randomUUID(),
        username: 'teacher',
        password: 'teacher123',
        role: 'teacher',
        name: 'John Doe',
        email: 'john.doe@school.com',
        nip: 'TCH001',
        phone: '081234567891'
    },
    {
        id: randomUUID(),
        username: 'staff',
        password: 'staff123',
        role: 'staff',
        name: 'Jane Smith',
        email: 'jane.smith@school.com',
        nip: 'STF001',
        phone: '081234567892'
    }
];

const departments = [
    {
        id: randomUUID(),
        name: 'Rekayasa Perangkat Lunak',
        code: 'RPL',
        description: 'Program keahlian pengembangan software'
    },
    {
        id: randomUUID(),
        name: 'Teknik Komputer dan Jaringan',
        code: 'TKJ',
        description: 'Program keahlian jaringan komputer'
    }
];

const schoolYears = [
    {
        id: randomUUID(),
        year: '2024/2025',
        semester: 'Ganjil',
        start_date: '2024-07-01',
        end_date: '2024-12-31',
        is_active: 1
    },
    {
        id: randomUUID(),
        year: '2024/2025',
        semester: 'Genap',
        start_date: '2025-01-01',
        end_date: '2025-06-30',
        is_active: 0
    }
];

// Seed data
async function seedDatabase() {
    const now = new Date().toISOString();
    
    // Create users table if not exists
    await new Promise<void>((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                nip TEXT NOT NULL,
                phone TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        `, (err) => {
            if (err) {
                console.error('Failed to create users table:', err);
                reject(err);
            } else {
                console.log('Users table ready');
                resolve();
            }
        });
    });

    // Create departments table if not exists
    await new Promise<void>((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS departments (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                code TEXT NOT NULL,
                description TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        `, (err) => {
            if (err) {
                console.error('Failed to create departments table:', err);
                reject(err);
            } else {
                console.log('Departments table ready');
                resolve();
            }
        });
    });

    // Create school years table if not exists
    await new Promise<void>((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS school_years (
                id TEXT PRIMARY KEY,
                year TEXT NOT NULL,
                semester TEXT NOT NULL,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                is_active INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        `, (err) => {
            if (err) {
                console.error('Failed to create school years table:', err);
                reject(err);
            } else {
                console.log('School years table ready');
                resolve();
            }
        });
    });

    // Seed users
    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await new Promise<void>((resolve, reject) => {
            db.run(
                `INSERT OR REPLACE INTO users (
                    id, username, password, role, name, email, nip, phone,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    user.id,
                    user.username,
                    hashedPassword,
                    user.role,
                    user.name,
                    user.email,
                    user.nip,
                    user.phone,
                    now,
                    now
                ],
                (err) => {
                    if (err) {
                        console.error('Failed to seed user:', err);
                        reject(err);
                    } else {
                        console.log('Seeded user:', user.username);
                        resolve();
                    }
                }
            );
        });
    }

    // Seed departments
    for (const dept of departments) {
        await new Promise<void>((resolve, reject) => {
            db.run(
                `INSERT OR REPLACE INTO departments (
                    id, name, code, description, status,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    dept.id,
                    dept.name,
                    dept.code,
                    dept.description,
                    'active',
                    now,
                    now
                ],
                (err) => {
                    if (err) {
                        console.error('Failed to seed department:', err);
                        reject(err);
                    } else {
                        console.log('Seeded department:', dept.name);
                        resolve();
                    }
                }
            );
        });
    }

    // Seed school years
    for (const year of schoolYears) {
        await new Promise<void>((resolve, reject) => {
            db.run(
                `INSERT OR REPLACE INTO school_years (
                    id, year, semester, start_date, end_date, is_active,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    year.id,
                    year.year,
                    year.semester,
                    year.start_date,
                    year.end_date,
                    year.is_active,
                    now,
                    now
                ],
                (err) => {
                    if (err) {
                        console.error('Failed to seed school year:', err);
                        reject(err);
                    } else {
                        console.log('Seeded school year:', `${year.year} ${year.semester}`);
                        resolve();
                    }
                }
            );
        });
    }
    
    console.log('Database seeding completed');
    db.close();
}

seedDatabase().catch(console.error);
