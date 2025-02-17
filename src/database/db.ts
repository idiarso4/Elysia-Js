import { Database } from 'sqlite3';

class DB {
    private static instance: Database;
    
    static getInstance(): Database {
        if (!DB.instance) {
            DB.instance = new Database('student_data.db');
        }
        return DB.instance;
    }
    
    static async query<T>(sql: string, params: any[] = []): Promise<T[]> {
        return new Promise((resolve, reject) => {
            DB.getInstance().all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows as T[]);
            });
        });
    }
    
    static async run(sql: string, params: any[] = []): Promise<void> {
        return new Promise((resolve, reject) => {
            DB.getInstance().run(sql, params, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
    
    static async get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
        return new Promise((resolve, reject) => {
            DB.getInstance().get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row as T);
            });
        });
    }
}

export default DB;
