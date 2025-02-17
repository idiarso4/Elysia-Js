'use client';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Box,
    Typography,
    IconButton,
    Tooltip,
    Chip,
    Stack,
} from '@mui/material';
import { IconMail, IconPhone } from '@tabler/icons-react';
import { useState, useEffect } from 'react';

interface Student {
    id: string;
    name: string;
    grade: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive';
    guardianName: string;
    guardianPhone: string;
}

interface StudentListProps {
    classId: string;
    onError: (message: string) => void;
}

export default function StudentList({ classId, onError }: StudentListProps) {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(
                    `http://localhost:3000/api/teacher/classes/${classId}/students`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch students');
                }

                const data = await response.json();
                setStudents(data);
            } catch (err) {
                onError(err instanceof Error ? err.message : 'Failed to load students');
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [classId, onError]);

    const filteredStudents = students.filter(
        (student) =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.guardianName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Loading students...</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <TextField
                fullWidth
                size="small"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mb: 3 }}
            />

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Student Name</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Contact</TableCell>
                            <TableCell>Guardian</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredStudents.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell>
                                    <Typography variant="subtitle2">
                                        {student.name}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        Grade {student.grade}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={student.status}
                                        color={student.status === 'active' ? 'success' : 'error'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1}>
                                        <Tooltip title={student.email}>
                                            <IconButton
                                                size="small"
                                                onClick={() => window.location.href = `mailto:${student.email}`}
                                            >
                                                <IconMail size={20} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={student.phone}>
                                            <IconButton
                                                size="small"
                                                onClick={() => window.location.href = `tel:${student.phone}`}
                                            >
                                                <IconPhone size={20} />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2">
                                        {student.guardianName}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {student.guardianPhone}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1}>
                                        <Tooltip title="View Details">
                                            <IconButton
                                                size="small"
                                                onClick={() => {/* TODO: Implement view details */}}
                                            >
                                                <IconMail size={20} />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
