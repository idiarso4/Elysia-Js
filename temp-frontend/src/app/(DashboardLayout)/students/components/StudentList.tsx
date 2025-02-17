import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Chip,
    Button,
    TextField,
    InputAdornment,
} from '@mui/material';
import { Edit, Delete, Search, Add } from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Student {
    id: string;
    name: string;
    age: number;
    grade: string;
    status: 'active' | 'inactive';
    updatedAt: string;
}

const StudentList = () => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [students, setStudents] = React.useState<Student[]>([]);
    const [totalStudents, setTotalStudents] = React.useState(0);
    const [search, setSearch] = React.useState('');
    const { data: session } = useSession();
    const router = useRouter();

    const fetchStudents = async () => {
        try {
            const res = await fetch(
                `http://localhost:3000/students?page=${page + 1}&limit=${rowsPerPage}`,
                {
                    headers: {
                        Authorization: `Bearer ${session?.user.token}`,
                    },
                }
            );
            const data = await res.json();
            setStudents(data.students);
            setTotalStudents(data.pagination.total);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    React.useEffect(() => {
        if (session?.user.token) {
            fetchStudents();
        }
    }, [page, rowsPerPage, session]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleEdit = (id: string) => {
        router.push(`/students/${id}`);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this student?')) return;

        try {
            const res = await fetch(`http://localhost:3000/students/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${session?.user.token}`,
                },
            });

            if (res.ok) {
                fetchStudents();
            }
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    };

    return (
        <Card variant="outlined">
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h3">Students</Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        onClick={() => router.push('/students/new')}
                    >
                        Add Student
                    </Button>
                </Box>

                <Box mb={3}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search students..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <Box sx={{ overflow: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Age</TableCell>
                                <TableCell>Grade</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Last Updated</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student.id} hover>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.age}</TableCell>
                                    <TableCell>{student.grade}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={student.status}
                                            color={student.status === 'active' ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(student.updatedAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleEdit(student.id)}
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDelete(student.id)}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={totalStudents}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </CardContent>
        </Card>
    );
};

export default StudentList;
