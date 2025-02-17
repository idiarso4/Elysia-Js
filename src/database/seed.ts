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
        role: 'admin'
    },
    {
        id: randomUUID(),
        username: 'teacher',
        password: 'teacher123',
        role: 'teacher'
    }
];

// Seed data
async function seedDatabase() {
    // Hash passwords
    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const now = new Date().toISOString();
        
        await new Promise<void>((resolve, reject) => {
            db.run(
                'INSERT OR IGNORE INTO users (id, username, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
                [user.id, user.username, hashedPassword, user.role, now, now],
                (err) => {
                    if (err) {
                        console.error('Seeding failed:', err);
                        reject(err);
                    } else {
                        console.log('Seeded user:', user.username);
                        resolve();
                    }
                }
            );
        });
    }
    
    db.close();
}

seedDatabase().catch(console.error);
