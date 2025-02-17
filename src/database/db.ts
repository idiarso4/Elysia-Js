import { Database } from 'sqlite3';

interface DBResult {
    changes?: number;
    lastID?: number;
}

class DB {
    private static db = new Database('student_data.db');

    static async query<T>(sql: string, params: any[] = []): Promise<T[]> {
        return new Promise((resolve, reject) => {
            DB.db.all(sql, params, (err, rows: T[]) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
    
    static async run(sql: string, params: any[] = []): Promise<DBResult> {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                resolve({ changes: this.changes, lastID: this.lastID });
            });
        });
    }
    
    static async get<T>(sql: string, params: any[] = []): Promise<T | null> {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row: T | undefined) => {
                if (err) reject(err);
                resolve(row || null);
            });
        });
    }
    
    static async all<T>(sql: string, params: any[] = []): Promise<T[]> {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows: T[]) => {
                if (err) reject(err);
                resolve(rows || []);
            });
        });
    }
}

export default DB;
