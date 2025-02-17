import { Database } from 'sqlite3';
import { randomUUID } from 'crypto';

const db = new Database('student_data.db');

interface Class {
    id: string;
    name: string;
    grade: string;
    majorId: string;
    teacherId: string;
    academicYearId: string;
    capacity: number;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

interface ClassWithDetails extends Class {
    majorName: string;
    teacherName: string;
    academicYear: string;
    currentStudents: number;
}

interface CreateClassDTO {
    name: string;
    grade: string;
    majorId: string;
    teacherId: string;
    academicYearId: string;
    capacity: number;
}

interface UpdateClassDTO {
    name?: string;
    grade?: string;
    majorId?: string;
    teacherId?: string;
    academicYearId?: string;
    capacity?: number;
    status?: 'active' | 'inactive';
}

export const classesController = {
    // Get all classes with details
    getClasses: () => {
        return new Promise<ClassWithDetails[]>((resolve, reject) => {
            db.all<ClassWithDetails>(
                `SELECT 
                    c.*,
                    m.name as majorName,
                    u.name as teacherName,
                    ay.name as academicYear,
                    (SELECT COUNT(*) FROM student_classes WHERE classId = c.id) as currentStudents
                FROM classes c
                LEFT JOIN majors m ON c.majorId = m.id
                LEFT JOIN users u ON c.teacherId = u.id
                LEFT JOIN academic_years ay ON c.academicYearId = ay.id
                ORDER BY c.grade, c.name`,
                (err, classes) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(classes);
                }
            );
        });
    },

    // Get class by ID
    getClassById: (id: string) => {
        return new Promise<ClassWithDetails | null>((resolve, reject) => {
            db.get<ClassWithDetails>(
                `SELECT 
                    c.*,
                    m.name as majorName,
                    u.name as teacherName,
                    ay.name as academicYear,
                    (SELECT COUNT(*) FROM student_classes WHERE classId = c.id) as currentStudents
                FROM classes c
                LEFT JOIN majors m ON c.majorId = m.id
                LEFT JOIN users u ON c.teacherId = u.id
                LEFT JOIN academic_years ay ON c.academicYearId = ay.id
                WHERE c.id = ?`,
                [id],
                (err, class_) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(class_ || null);
                }
            );
        });
    },

    // Create new class
    createClass: async (data: CreateClassDTO) => {
        // Validate capacity
        if (data.capacity < 1) {
            throw new Error('Capacity must be greater than 0');
        }

        // Validate teacher exists and is a teacher
        const teacher = await new Promise<any>((resolve, reject) => {
            db.get(
                'SELECT * FROM users WHERE id = ? AND role = ?',
                [data.teacherId, 'teacher'],
                (err, teacher) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(teacher);
                }
            );
        });

        if (!teacher) {
            throw new Error('Invalid teacher ID');
        }

        // Validate major exists
        const major = await new Promise<any>((resolve, reject) => {
            db.get(
                'SELECT * FROM majors WHERE id = ?',
                [data.majorId],
                (err, major) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(major);
                }
            );
        });

        if (!major) {
            throw new Error('Invalid major ID');
        }

        // Validate academic year exists and is active
        const academicYear = await new Promise<any>((resolve, reject) => {
            db.get(
                'SELECT * FROM academic_years WHERE id = ? AND status = ?',
                [data.academicYearId, 'active'],
                (err, year) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(year);
                }
            );
        });

        if (!academicYear) {
            throw new Error('Invalid or inactive academic year');
        }

        const id = randomUUID();
        const now = new Date().toISOString();

        return new Promise<string>((resolve, reject) => {
            db.run(
                `INSERT INTO classes (
                    id, name, grade, majorId, teacherId, academicYearId, 
                    capacity, status, createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
                [id, data.name, data.grade, data.majorId, data.teacherId, 
                 data.academicYearId, data.capacity, now, now],
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

    // Update class
    updateClass: async (id: string, data: UpdateClassDTO) => {
        const class_ = await classesController.getClassById(id);
        if (!class_) {
            throw new Error('Class not found');
        }

        if (data.capacity !== undefined && data.capacity < class_.currentStudents) {
            throw new Error('New capacity cannot be less than current number of students');
        }

        if (data.teacherId) {
            const teacher = await new Promise<any>((resolve, reject) => {
                db.get(
                    'SELECT * FROM users WHERE id = ? AND role = ?',
                    [data.teacherId, 'teacher'],
                    (err, teacher) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(teacher);
                    }
                );
            });

            if (!teacher) {
                throw new Error('Invalid teacher ID');
            }
        }

        if (data.majorId) {
            const major = await new Promise<any>((resolve, reject) => {
                db.get(
                    'SELECT * FROM majors WHERE id = ?',
                    [data.majorId],
                    (err, major) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(major);
                    }
                );
            });

            if (!major) {
                throw new Error('Invalid major ID');
            }
        }

        if (data.academicYearId) {
            const academicYear = await new Promise<any>((resolve, reject) => {
                db.get(
                    'SELECT * FROM academic_years WHERE id = ? AND status = ?',
                    [data.academicYearId, 'active'],
                    (err, year) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(year);
                    }
                );
            });

            if (!academicYear) {
                throw new Error('Invalid or inactive academic year');
            }
        }

        const updates: string[] = [];
        const values: any[] = [];

        if (data.name) {
            updates.push('name = ?');
            values.push(data.name);
        }

        if (data.grade) {
            updates.push('grade = ?');
            values.push(data.grade);
        }

        if (data.majorId) {
            updates.push('majorId = ?');
            values.push(data.majorId);
        }

        if (data.teacherId) {
            updates.push('teacherId = ?');
            values.push(data.teacherId);
        }

        if (data.academicYearId) {
            updates.push('academicYearId = ?');
            values.push(data.academicYearId);
        }

        if (data.capacity !== undefined) {
            updates.push('capacity = ?');
            values.push(data.capacity);
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
                `UPDATE classes SET ${updates.join(', ')} WHERE id = ?`,
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

    // Delete class
    deleteClass: async (id: string) => {
        const class_ = await classesController.getClassById(id);
        if (!class_) {
            throw new Error('Class not found');
        }

        // Check if class has students
        const hasStudents = await new Promise<boolean>((resolve, reject) => {
            db.get(
                'SELECT COUNT(*) as count FROM student_classes WHERE classId = ?',
                [id],
                (err, result: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result.count > 0);
                }
            );
        });

        if (hasStudents) {
            throw new Error('Cannot delete class with enrolled students');
        }

        return new Promise<void>((resolve, reject) => {
            db.run(
                'DELETE FROM classes WHERE id = ?',
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
    },

    // Get students in a class
    getClassStudents: (classId: string) => {
        return new Promise<any[]>((resolve, reject) => {
            db.all(
                `SELECT 
                    s.*,
                    sc.enrolledAt
                FROM students s
                JOIN student_classes sc ON s.id = sc.studentId
                WHERE sc.classId = ?
                ORDER BY s.name`,
                [classId],
                (err, students) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(students);
                }
            );
        });
    },

    // Add student to class
    addStudentToClass: async (classId: string, studentId: string) => {
        const class_ = await classesController.getClassById(classId);
        if (!class_) {
            throw new Error('Class not found');
        }

        if (class_.currentStudents >= class_.capacity) {
            throw new Error('Class is at full capacity');
        }

        // Check if student is already in a class for this academic year
        const existingEnrollment = await new Promise<boolean>((resolve, reject) => {
            db.get(
                `SELECT COUNT(*) as count 
                FROM student_classes sc
                JOIN classes c ON sc.classId = c.id
                WHERE sc.studentId = ? AND c.academicYearId = ?`,
                [studentId, class_.academicYearId],
                (err, result: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result.count > 0);
                }
            );
        });

        if (existingEnrollment) {
            throw new Error('Student is already enrolled in a class for this academic year');
        }

        const now = new Date().toISOString();

        return new Promise<void>((resolve, reject) => {
            db.run(
                `INSERT INTO student_classes (studentId, classId, enrolledAt)
                VALUES (?, ?, ?)`,
                [studentId, classId, now],
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

    // Remove student from class
    removeStudentFromClass: async (classId: string, studentId: string) => {
        return new Promise<void>((resolve, reject) => {
            db.run(
                'DELETE FROM student_classes WHERE classId = ? AND studentId = ?',
                [classId, studentId],
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
