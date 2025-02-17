import { Database } from 'sqlite3';
import { randomUUID } from 'crypto';

const db = new Database('student_data.db');

interface Schedule {
    id: string;
    classId: string;
    subjectId: string;
    teacherId: string;
    dayOfWeek: number; // 1-7 (Senin-Minggu)
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
    room: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

interface ScheduleWithDetails extends Schedule {
    className: string;
    subjectName: string;
    teacherName: string;
}

interface CreateScheduleDTO {
    classId: string;
    subjectId: string;
    teacherId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room: string;
}

interface UpdateScheduleDTO {
    subjectId?: string;
    teacherId?: string;
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
    room?: string;
    status?: 'active' | 'inactive';
}

export const schedulesController = {
    // Get all schedules with details
    getSchedules: () => {
        return new Promise<ScheduleWithDetails[]>((resolve, reject) => {
            db.all<ScheduleWithDetails>(
                `SELECT 
                    s.*,
                    c.name as className,
                    sub.name as subjectName,
                    u.name as teacherName
                FROM schedules s
                LEFT JOIN classes c ON s.classId = c.id
                LEFT JOIN subjects sub ON s.subjectId = sub.id
                LEFT JOIN users u ON s.teacherId = u.id
                ORDER BY s.dayOfWeek, s.startTime`,
                (err, schedules) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(schedules);
                }
            );
        });
    },

    // Get schedules by class ID
    getSchedulesByClass: (classId: string) => {
        return new Promise<ScheduleWithDetails[]>((resolve, reject) => {
            db.all<ScheduleWithDetails>(
                `SELECT 
                    s.*,
                    c.name as className,
                    sub.name as subjectName,
                    u.name as teacherName
                FROM schedules s
                LEFT JOIN classes c ON s.classId = c.id
                LEFT JOIN subjects sub ON s.subjectId = sub.id
                LEFT JOIN users u ON s.teacherId = u.id
                WHERE s.classId = ?
                ORDER BY s.dayOfWeek, s.startTime`,
                [classId],
                (err, schedules) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(schedules);
                }
            );
        });
    },

    // Get schedules by teacher ID
    getSchedulesByTeacher: (teacherId: string) => {
        return new Promise<ScheduleWithDetails[]>((resolve, reject) => {
            db.all<ScheduleWithDetails>(
                `SELECT 
                    s.*,
                    c.name as className,
                    sub.name as subjectName,
                    u.name as teacherName
                FROM schedules s
                LEFT JOIN classes c ON s.classId = c.id
                LEFT JOIN subjects sub ON s.subjectId = sub.id
                LEFT JOIN users u ON s.teacherId = u.id
                WHERE s.teacherId = ?
                ORDER BY s.dayOfWeek, s.startTime`,
                [teacherId],
                (err, schedules) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(schedules);
                }
            );
        });
    },

    // Create new schedule
    createSchedule: async (data: CreateScheduleDTO) => {
        // Validate time format
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(data.startTime) || !timeRegex.test(data.endTime)) {
            throw new Error('Invalid time format. Use HH:mm format');
        }

        // Validate day of week
        if (data.dayOfWeek < 1 || data.dayOfWeek > 7) {
            throw new Error('Day of week must be between 1 and 7');
        }

        // Check for schedule conflicts
        const conflicts = await new Promise<boolean>((resolve, reject) => {
            db.get(
                `SELECT COUNT(*) as count FROM schedules
                WHERE classId = ? AND dayOfWeek = ? AND status = 'active'
                AND (
                    (startTime <= ? AND endTime > ?) OR
                    (startTime < ? AND endTime >= ?) OR
                    (startTime >= ? AND endTime <= ?)
                )`,
                [
                    data.classId, data.dayOfWeek,
                    data.startTime, data.startTime,
                    data.endTime, data.endTime,
                    data.startTime, data.endTime
                ],
                (err, result: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result.count > 0);
                }
            );
        });

        if (conflicts) {
            throw new Error('Schedule conflicts with existing class schedule');
        }

        // Check teacher availability
        const teacherConflicts = await new Promise<boolean>((resolve, reject) => {
            db.get(
                `SELECT COUNT(*) as count FROM schedules
                WHERE teacherId = ? AND dayOfWeek = ? AND status = 'active'
                AND (
                    (startTime <= ? AND endTime > ?) OR
                    (startTime < ? AND endTime >= ?) OR
                    (startTime >= ? AND endTime <= ?)
                )`,
                [
                    data.teacherId, data.dayOfWeek,
                    data.startTime, data.startTime,
                    data.endTime, data.endTime,
                    data.startTime, data.endTime
                ],
                (err, result: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result.count > 0);
                }
            );
        });

        if (teacherConflicts) {
            throw new Error('Teacher is not available at this time');
        }

        const id = randomUUID();
        const now = new Date().toISOString();

        return new Promise<string>((resolve, reject) => {
            db.run(
                `INSERT INTO schedules (
                    id, classId, subjectId, teacherId, dayOfWeek,
                    startTime, endTime, room, status, createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
                [id, data.classId, data.subjectId, data.teacherId, data.dayOfWeek,
                 data.startTime, data.endTime, data.room, now, now],
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

    // Update schedule
    updateSchedule: async (id: string, data: UpdateScheduleDTO) => {
        if (data.startTime || data.endTime) {
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (data.startTime && !timeRegex.test(data.startTime)) {
                throw new Error('Invalid start time format. Use HH:mm format');
            }
            if (data.endTime && !timeRegex.test(data.endTime)) {
                throw new Error('Invalid end time format. Use HH:mm format');
            }
        }

        if (data.dayOfWeek && (data.dayOfWeek < 1 || data.dayOfWeek > 7)) {
            throw new Error('Day of week must be between 1 and 7');
        }

        const schedule = await new Promise<Schedule | null>((resolve, reject) => {
            db.get<Schedule>(
                'SELECT * FROM schedules WHERE id = ?',
                [id],
                (err, schedule) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(schedule || null);
                }
            );
        });

        if (!schedule) {
            throw new Error('Schedule not found');
        }

        // Check for conflicts if time or day is being updated
        if (data.startTime || data.endTime || data.dayOfWeek) {
            const startTime = data.startTime || schedule.startTime;
            const endTime = data.endTime || schedule.endTime;
            const dayOfWeek = data.dayOfWeek || schedule.dayOfWeek;

            const conflicts = await new Promise<boolean>((resolve, reject) => {
                db.get(
                    `SELECT COUNT(*) as count FROM schedules
                    WHERE classId = ? AND dayOfWeek = ? AND status = 'active'
                    AND id != ? AND (
                        (startTime <= ? AND endTime > ?) OR
                        (startTime < ? AND endTime >= ?) OR
                        (startTime >= ? AND endTime <= ?)
                    )`,
                    [
                        schedule.classId, dayOfWeek, id,
                        startTime, startTime,
                        endTime, endTime,
                        startTime, endTime
                    ],
                    (err, result: any) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(result.count > 0);
                    }
                );
            });

            if (conflicts) {
                throw new Error('Schedule conflicts with existing class schedule');
            }

            // Check teacher availability if teacher is being updated
            const teacherId = data.teacherId || schedule.teacherId;
            const teacherConflicts = await new Promise<boolean>((resolve, reject) => {
                db.get(
                    `SELECT COUNT(*) as count FROM schedules
                    WHERE teacherId = ? AND dayOfWeek = ? AND status = 'active'
                    AND id != ? AND (
                        (startTime <= ? AND endTime > ?) OR
                        (startTime < ? AND endTime >= ?) OR
                        (startTime >= ? AND endTime <= ?)
                    )`,
                    [
                        teacherId, dayOfWeek, id,
                        startTime, startTime,
                        endTime, endTime,
                        startTime, endTime
                    ],
                    (err, result: any) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(result.count > 0);
                    }
                );
            });

            if (teacherConflicts) {
                throw new Error('Teacher is not available at this time');
            }
        }

        const updates: string[] = [];
        const values: any[] = [];

        if (data.subjectId) {
            updates.push('subjectId = ?');
            values.push(data.subjectId);
        }

        if (data.teacherId) {
            updates.push('teacherId = ?');
            values.push(data.teacherId);
        }

        if (data.dayOfWeek) {
            updates.push('dayOfWeek = ?');
            values.push(data.dayOfWeek);
        }

        if (data.startTime) {
            updates.push('startTime = ?');
            values.push(data.startTime);
        }

        if (data.endTime) {
            updates.push('endTime = ?');
            values.push(data.endTime);
        }

        if (data.room) {
            updates.push('room = ?');
            values.push(data.room);
        }

        if (data.status) {
            updates.push('status = ?');
            values.push(data.status);
        }

        updates.push('updatedAt = ?');
        values.push(new Date().toISOString());

        values.push(id);

        return new Promise<void>((resolve, reject) => {
            db.run(
                `UPDATE schedules SET ${updates.join(', ')} WHERE id = ?`,
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

    // Delete schedule
    deleteSchedule: async (id: string) => {
        const schedule = await new Promise<Schedule | null>((resolve, reject) => {
            db.get<Schedule>(
                'SELECT * FROM schedules WHERE id = ?',
                [id],
                (err, schedule) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(schedule || null);
                }
            );
        });

        if (!schedule) {
            throw new Error('Schedule not found');
        }

        return new Promise<void>((resolve, reject) => {
            db.run(
                'DELETE FROM schedules WHERE id = ?',
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
