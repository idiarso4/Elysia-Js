'use client';
import {
    Grid,
    Card,
    Stack,
    Typography,
    Button,
    Box,
    IconButton,
    Tooltip,
    Chip,
} from '@mui/material';
import { useState } from 'react';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import {
    IconPlus,
    IconPencil,
    IconTrash,
    IconUsers,
    IconChalkboard,
} from '@tabler/icons-react';
import CustomTable from '@/app/(DashboardLayout)/components/shared/CustomTable';
import DeleteDialog from '@/app/(DashboardLayout)/components/shared/DeleteDialog';
import ClassForm from './components/ClassForm';
import ClassDetail from './components/ClassDetail';

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

const columns = [
    { 
        id: 'name', 
        label: 'Nama Kelas',
        width: 120
    },
    { 
        id: 'grade', 
        label: 'Tingkat',
        width: 100
    },
    { 
        id: 'major', 
        label: 'Jurusan',
        width: 150,
        render: (value: Class['major']) => value.name
    },
    { 
        id: 'teacher', 
        label: 'Wali Kelas',
        width: 200,
        render: (value: Class['teacher']) => (
            <Stack>
                <Typography variant="body2">{value.name}</Typography>
                <Typography variant="caption" color="textSecondary">NIP: {value.nip}</Typography>
            </Stack>
        )
    },
    { 
        id: 'academicYear', 
        label: 'Tahun Ajaran',
        width: 150,
        render: (value: Class['academicYear']) => (
            `${value.year} - ${value.semester}`
        )
    },
    { 
        id: 'capacity', 
        label: 'Kapasitas',
        width: 120,
        render: (value: number, row: Class) => (
            <Stack direction="row" spacing={1} alignItems="center">
                <IconUsers size={16} />
                <Typography>
                    {row.studentCount}/{value}
                </Typography>
            </Stack>
        )
    },
    { 
        id: 'room', 
        label: 'Ruangan',
        width: 120,
        render: (value: string) => (
            <Stack direction="row" spacing={1} alignItems="center">
                <IconChalkboard size={16} />
                <Typography>{value}</Typography>
            </Stack>
        )
    },
    { 
        id: 'status', 
        label: 'Status',
        width: 100,
        render: (value: string) => (
            <Chip
                label={value === 'active' ? 'Aktif' : 'Nonaktif'}
                color={value === 'active' ? 'success' : 'default'}
                size="small"
            />
        )
    },
];

export default function ClassesPage() {
    const [data, setData] = useState<Class[]>([]);
    const [loading, setLoading] = useState(false);
    const [openForm, setOpenForm] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Class | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAdd = () => {
        setSelectedItem(null);
        setOpenForm(true);
    };

    const handleEdit = (item: Class) => {
        setSelectedItem(item);
        setOpenForm(true);
    };

    const handleView = (item: Class) => {
        setSelectedItem(item);
        setOpenDetail(true);
    };

    const handleDelete = (item: Class) => {
        setSelectedItem(item);
        setOpenDelete(true);
    };

    const handleSave = async (formData: Partial<Class>) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = selectedItem
                ? `http://localhost:3000/api/master/classes/${selectedItem.id}`
                : 'http://localhost:3000/api/master/classes';
            
            const response = await fetch(url, {
                method: selectedItem ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to save class');
            }

            // Refresh data
            fetchData();
            setOpenForm(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedItem) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:3000/api/master/classes/${selectedItem.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete class');
            }

            // Refresh data
            fetchData();
            setOpenDelete(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/master/classes', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch classes');
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const renderActions = (item: Class) => (
        <Stack direction="row" spacing={1}>
            <Tooltip title="Lihat Detail">
                <IconButton 
                    size="small" 
                    onClick={() => handleView(item)}
                    color="info"
                >
                    <IconUsers size={20} />
                </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
                <IconButton 
                    size="small" 
                    onClick={() => handleEdit(item)}
                    color="primary"
                >
                    <IconPencil size={20} />
                </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
                <IconButton 
                    size="small" 
                    onClick={() => handleDelete(item)}
                    color="error"
                    disabled={item.studentCount > 0}
                >
                    <IconTrash size={20} />
                </IconButton>
            </Tooltip>
        </Stack>
    );

    return (
        <PageContainer>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card>
                        <Stack 
                            direction="row" 
                            justifyContent="space-between" 
                            alignItems="center"
                            sx={{ p: 2 }}
                        >
                            <Typography variant="h5">Data Kelas</Typography>
                            <Button
                                variant="contained"
                                startIcon={<IconPlus />}
                                onClick={handleAdd}
                            >
                                Tambah Kelas
                            </Button>
                        </Stack>
                        <Box sx={{ overflow: 'auto' }}>
                            <CustomTable
                                columns={columns}
                                data={data}
                                loading={loading}
                                error={error}
                                actions={renderActions}
                            />
                        </Box>
                    </Card>
                </Grid>
            </Grid>

            {/* Form Dialog */}
            <ClassForm
                open={openForm}
                onClose={() => setOpenForm(false)}
                onSave={handleSave}
                data={selectedItem}
                loading={loading}
            />

            {/* Detail Dialog */}
            <ClassDetail
                open={openDetail}
                onClose={() => setOpenDetail(false)}
                data={selectedItem}
            />

            {/* Delete Confirmation */}
            <DeleteDialog
                open={openDelete}
                onClose={() => setOpenDelete(false)}
                onConfirm={handleConfirmDelete}
                loading={loading}
                title="Hapus Kelas"
                content={`Apakah Anda yakin ingin menghapus kelas ${selectedItem?.name}?`}
            />
        </PageContainer>
    );
}
