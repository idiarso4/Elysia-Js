import { Database } from 'sqlite3';

const db = new Database('student_data.db');

// Create tables in the correct order based on dependencies
const migrations = [
    // Drop existing tables first
    `DROP TABLE IF EXISTS users`,
    `DROP TABLE IF EXISTS departments`,
    `DROP TABLE IF EXISTS school_years`,
    `DROP TABLE IF EXISTS class_rooms`,
    `DROP TABLE IF EXISTS students`,
    `DROP TABLE IF EXISTS subjects`,
    `DROP TABLE IF EXISTS extracurriculars`,
    `DROP TABLE IF EXISTS internships`,
    `DROP TABLE IF EXISTS journals`,
    `DROP TABLE IF EXISTS teaching_activities`,
    `DROP TABLE IF EXISTS student_details`,
    `DROP TABLE IF EXISTS mutations`,
    `DROP TABLE IF EXISTS attendances`,

    // Create tables
    `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        nip TEXT UNIQUE,
        phone TEXT,
        photo TEXT,
        user_type TEXT,
        class_room_id TEXT,
        is_banned INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        description TEXT,
        head_of_department_id TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (head_of_department_id) REFERENCES users(id)
    )`,

    `CREATE TABLE IF NOT EXISTS school_years (
        id TEXT PRIMARY KEY,
        year TEXT NOT NULL,
        semester TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        is_active INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS class_rooms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        grade TEXT NOT NULL,
        department_id TEXT,
        capacity INTEGER NOT NULL,
        room_number TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (department_id) REFERENCES departments(id)
    )`,

    `CREATE TABLE IF NOT EXISTS class_room_teacher (
        class_room_id TEXT NOT NULL,
        teacher_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (class_room_id, teacher_id),
        FOREIGN KEY (class_room_id) REFERENCES class_rooms(id),
        FOREIGN KEY (teacher_id) REFERENCES users(id)
    )`,

    `CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE,
        nis TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        gender TEXT NOT NULL,
        birth_place TEXT NOT NULL,
        birth_date TEXT NOT NULL,
        religion TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        parent_name TEXT NOT NULL,
        parent_phone TEXT NOT NULL,
        class_room_id TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (class_room_id) REFERENCES class_rooms(id)
    )`,

    `CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS extracurriculars (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        day_time TEXT NOT NULL,
        location TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        guru_id TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (guru_id) REFERENCES users(id)
    )`,

    `CREATE TABLE IF NOT EXISTS extracurricular_teacher (
        extracurricular_id TEXT NOT NULL,
        teacher_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (extracurricular_id, teacher_id),
        FOREIGN KEY (extracurricular_id) REFERENCES extracurriculars(id),
        FOREIGN KEY (teacher_id) REFERENCES users(id)
    )`,

    `CREATE TABLE IF NOT EXISTS extracurricular_student (
        extracurricular_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (extracurricular_id, student_id),
        FOREIGN KEY (extracurricular_id) REFERENCES extracurriculars(id),
        FOREIGN KEY (student_id) REFERENCES students(id)
    )`,

    `CREATE TABLE IF NOT EXISTS teaching_activities (
        id TEXT PRIMARY KEY,
        teacher_id TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        class_room_id TEXT NOT NULL,
        topic TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (teacher_id) REFERENCES users(id),
        FOREIGN KEY (subject_id) REFERENCES subjects(id),
        FOREIGN KEY (class_room_id) REFERENCES class_rooms(id)
    )`,

    `CREATE TABLE IF NOT EXISTS teacher_journals (
        id TEXT PRIMARY KEY,
        teacher_id TEXT NOT NULL,
        teaching_activity_id TEXT NOT NULL,
        content TEXT NOT NULL,
        attachments TEXT,
        status TEXT DEFAULT 'draft',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (teacher_id) REFERENCES users(id),
        FOREIGN KEY (teaching_activity_id) REFERENCES teaching_activities(id)
    )`,

    `CREATE TABLE IF NOT EXISTS class_attendances (
        id TEXT PRIMARY KEY,
        teaching_activity_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        status TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (teaching_activity_id) REFERENCES teaching_activities(id),
        FOREIGN KEY (student_id) REFERENCES students(id)
    )`,

    `CREATE TABLE IF NOT EXISTS prayer_attendances (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        date TEXT NOT NULL,
        prayer_time TEXT NOT NULL,
        status TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id)
    )`,

    `CREATE TABLE IF NOT EXISTS student_permits (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        type TEXT NOT NULL,
        reason TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        approved_by TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (approved_by) REFERENCES users(id)
    )`,

    `CREATE TABLE IF NOT EXISTS mutations (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        from_class_id TEXT NOT NULL,
        to_class_id TEXT NOT NULL,
        type TEXT NOT NULL,
        reason TEXT NOT NULL,
        effective_date TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        approved_by TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (from_class_id) REFERENCES class_rooms(id),
        FOREIGN KEY (to_class_id) REFERENCES class_rooms(id),
        FOREIGN KEY (approved_by) REFERENCES users(id)
    )`,

    `CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )`
];

// Run migrations sequentially
async function runMigrations() {
    for (const migration of migrations) {
        await new Promise<void>((resolve, reject) => {
            db.run(migration, (err) => {
                if (err) {
                    console.error('Migration failed:', err);
                    reject(err);
                } else {
                    console.log('Migration successful:', migration.split('\n')[0]);
                    resolve();
                }
            });
        });
    }
    
    console.log('All migrations completed');
    db.close();
}

runMigrations().catch(console.error);
