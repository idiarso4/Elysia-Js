'use client';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    FormHelperText,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';

interface Class {
    id: string;
    name: string;
    grade: string;
    major: {
        id: string;
        name: string;
    };
    teacher: {
        id: string;
        name: string;
        nip: string;
    };
    academicYear: {
        id: string;
        year: string;
        semester: string;
    };
    capacity: number;
    studentCount: number;
    room: string;
    status: 'active' | 'inactive';
}

interface Major {
    id: string;
    name: string;
}

interface Teacher {
    id: string;
    name: string;
    nip: string;
}

interface AcademicYear {
    id: string;
    year: string;
    semester: string;
    isActive: boolean;
}

interface ClassFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: Partial<Class>) => Promise<void>;
    data?: Class | null;
    loading?: boolean;
}

const INITIAL_DATA: Partial<Class> = {
    name: '',
    grade: '',
    capacity: 30,
    room: '',
    status: 'active',
};

const GRADES = ['X', 'XI', 'XII'];

export default function ClassForm({
    open,
    onClose,
    onSave,
    data,
    loading,
}: ClassFormProps) {
    const [formData, setFormData] = useState<Partial<Class>>(INITIAL_DATA);
    const [errors, setErrors] = useState<Partial<Record<keyof Class, string>>>({});
    const [majors, setMajors] = useState<Major[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

    useEffect(() => {
        if (data) {
            setFormData(data);
        } else {
            setFormData(INITIAL_DATA);
        }
        setErrors({});
        fetchMajors();
        fetchTeachers();
        fetchAcademicYears();
    }, [data]);

    const fetchMajors = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/master/majors', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch majors');
            }

            const result = await response.json();
            setMajors(result);
        } catch (error) {
            console.error('Failed to fetch majors:', error);
        }
    };

    const fetchTeachers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/master/teachers', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch teachers');
            }

            const result = await response.json();
            setTeachers(result);
        } catch (error) {
            console.error('Failed to fetch teachers:', error);
        }
    };

    const fetchAcademicYears = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/master/academic-years', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch academic years');
            }

            const result = await response.json();
            setAcademicYears(result);
        } catch (error) {
            console.error('Failed to fetch academic years:', error);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof Class, string>> = {};
        
        if (!formData.name?.trim()) {
            newErrors.name = 'Nama kelas harus diisi';
        }
        
        if (!formData.grade) {
            newErrors.grade = 'Tingkat kelas harus dipilih';
        }
        
        if (!formData.major?.id) {
            newErrors.major = 'Jurusan harus dipilih';
        }
        
        if (!formData.teacher?.id) {
            newErrors.teacher = 'Wali kelas harus dipilih';
        }
        
        if (!formData.academicYear?.id) {
            newErrors.academicYear = 'Tahun ajaran harus dipilih';
        }
        
        if (!formData.capacity || formData.capacity < 1) {
            newErrors.capacity = 'Kapasitas harus lebih dari 0';
        }
        
        if (!formData.room?.trim()) {
            newErrors.room = 'Ruangan harus diisi';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        await onSave(formData);
    };

    const handleChange = (field: keyof Class, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
        // Clear error when field is edited
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined,
            }));
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                {data ? 'Edit Kelas' : 'Tambah Kelas'}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Nama Kelas"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            error={!!errors.name}
                            helperText={errors.name}
                            fullWidth
                            required
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth required error={!!errors.grade}>
                            <InputLabel>Tingkat</InputLabel>
                            <Select
                                value={formData.grade}
                                label="Tingkat"
                                onChange={(e) => handleChange('grade', e.target.value)}
                            >
                                {GRADES.map((grade) => (
                                    <MenuItem key={grade} value={grade}>
                                        {grade}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.grade && (
                                <FormHelperText>{errors.grade}</FormHelperText>
                            )}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth required error={!!errors.major}>
                            <InputLabel>Jurusan</InputLabel>
                            <Select
                                value={formData.major?.id || ''}
                                label="Jurusan"
                                onChange={(e) => handleChange('major', {
                                    id: e.target.value,
                                    name: majors.find(m => m.id === e.target.value)?.name
                                })}
                            >
                                {majors.map((major) => (
                                    <MenuItem key={major.id} value={major.id}>
                                        {major.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.major && (
                                <FormHelperText>{errors.major}</FormHelperText>
                            )}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth required error={!!errors.teacher}>
                            <InputLabel>Wali Kelas</InputLabel>
                            <Select
                                value={formData.teacher?.id || ''}
                                label="Wali Kelas"
                                onChange={(e) => handleChange('teacher', {
                                    id: e.target.value,
                                    ...teachers.find(t => t.id === e.target.value)
                                })}
                            >
                                {teachers.map((teacher) => (
                                    <MenuItem key={teacher.id} value={teacher.id}>
                                        {teacher.name} - {teacher.nip}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.teacher && (
                                <FormHelperText>{errors.teacher}</FormHelperText>
                            )}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth required error={!!errors.academicYear}>
                            <InputLabel>Tahun Ajaran</InputLabel>
                            <Select
                                value={formData.academicYear?.id || ''}
                                label="Tahun Ajaran"
                                onChange={(e) => handleChange('academicYear', {
                                    id: e.target.value,
                                    ...academicYears.find(ay => ay.id === e.target.value)
                                })}
                            >
                                {academicYears.map((year) => (
                                    <MenuItem key={year.id} value={year.id}>
                                        {year.year} - {year.semester}
                                        {year.isActive ? ' (Aktif)' : ''}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.academicYear && (
                                <FormHelperText>{errors.academicYear}</FormHelperText>
                            )}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Kapasitas"
                            type="number"
                            value={formData.capacity}
                            onChange={(e) => handleChange('capacity', parseInt(e.target.value))}
                            error={!!errors.capacity}
                            helperText={errors.capacity}
                            fullWidth
                            required
                            inputProps={{ min: 1 }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Ruangan"
                            value={formData.room}
                            onChange={(e) => handleChange('room', e.target.value)}
                            error={!!errors.room}
                            helperText={errors.room}
                            fullWidth
                            required
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth required>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={formData.status}
                                label="Status"
                                onChange={(e) => handleChange('status', e.target.value)}
                            >
                                <MenuItem value="active">Aktif</MenuItem>
                                <MenuItem value="inactive">Nonaktif</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>
                    Batal
                </Button>
                <LoadingButton 
                    onClick={handleSubmit}
                    loading={loading}
                    variant="contained"
                >
                    Simpan
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
