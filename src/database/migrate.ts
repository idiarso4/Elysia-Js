import { Database } from 'sqlite3';

const db = new Database('student_data.db');

// Create tables
const migrations = [
    `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
    )`,
    
    `CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        grade TEXT NOT NULL,
        address TEXT NOT NULL,
        status TEXT NOT NULL,
        photo TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
    )`,
    
    `CREATE TABLE IF NOT EXISTS guardians (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        name TEXT NOT NULL,
        relationship TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        address TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL,
        note TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS academic_records (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        subject TEXT NOT NULL,
        score INTEGER NOT NULL,
        term TEXT NOT NULL,
        year TEXT NOT NULL,
        teacher TEXT NOT NULL,
        comments TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        uploadedAt TEXT NOT NULL,
        FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS communications (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        type TEXT NOT NULL,
        subject TEXT NOT NULL,
        content TEXT NOT NULL,
        sender TEXT NOT NULL,
        recipient TEXT NOT NULL,
        status TEXT NOT NULL,
        scheduledFor TEXT,
        sentAt TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS schedule (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        location TEXT,
        description TEXT,
        recurring BOOLEAN,
        recurrencePattern TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
    )`
];

// Run migrations
async function runMigrations() {
    for (const migration of migrations) {
        await new Promise<void>((resolve, reject) => {
            db.run(migration, (err) => {
                if (err) {
                    console.error('Migration failed:', err);
                    reject(err);
                } else {
                    console.log('Migration successful');
                    resolve();
                }
            });
        });
    }
    
    db.close();
}

runMigrations().catch(console.error);
