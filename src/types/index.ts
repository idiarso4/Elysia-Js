export interface Student {
    id: string;
    name: string;
    age: number;
    grade: string;
    address: string;
    status: string;
    photo?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Guardian {
    id: string;
    studentId: string;
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    address: string;
    createdAt: string;
    updatedAt: string;
}

export interface Attendance {
    id: string;
    studentId: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AcademicRecord {
    id: string;
    studentId: string;
    subject: string;
    semester: string;
    grade: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: string;
    username: string;
    password: string;
    role: 'admin' | 'teacher' | 'staff';
    createdAt: string;
    updatedAt: string;
}

export interface LoginResponse {
    token: string;
    user: {
        username: string;
        role: string;
    };
}
