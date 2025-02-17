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
    Avatar,
} from '@mui/material';
import { useState } from 'react';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { IconPlus, IconPencil, IconTrash, IconEye } from '@tabler/icons-react';
import CustomTable from '@/app/(DashboardLayout)/components/shared/CustomTable';
import DeleteDialog from '@/app/(DashboardLayout)/components/shared/DeleteDialog';
import StudentForm from './components/StudentForm';
import StudentDetail from './components/StudentDetail';

interface Student {
    id: string;
    nis: string;
    name: string;
    gender: 'L' | 'P';
    birthPlace: string;
    birthDate: string;
    religion: string;
    address: string;
    phone: string;
    email: string;
    photo: string;
    class: {
        id: string;
        name: string;
        grade: string;
    };
    parentName: string;
    parentPhone: string;
    status: 'active' | 'inactive' | 'graduated' | 'transferred';
}

const columns = [
    { 
        id: 'photo', 
        label: 'Photo',
        width: 80,
        render: (value: string, row: Student) => (
            <Avatar
                src={value || `/images/profile/user-1.jpg`}
                alt={row.name}
                sx={{ width: 40, height: 40 }}
            />
        )
    },
    { 
        id: 'nis', 
        label: 'NIS',
        width: 120
    },
    { 
        id: 'name', 
        label: 'Nama Siswa',
        width: 200
    },
    { 
        id: 'class', 
        label: 'Kelas',
        width: 120,
        render: (value: Student['class']) => `${value.name} - ${value.grade}`
    },
    { 
        id: 'gender', 
        label: 'JK',
        width: 80,
        render: (value: string) => value === 'L' ? 'Laki-laki' : 'Perempuan'
    },
    { 
        id: 'phone', 
        label: 'No. HP',
        width: 130
    },
    { 
        id: 'parentName', 
        label: 'Nama Orang Tua',
        width: 180
    },
    { 
        id: 'status', 
        label: 'Status',
        width: 120,
        render: (value: string) => {
            const statusConfig = {
                active: { label: 'Aktif', color: 'success' },
                inactive: { label: 'Nonaktif', color: 'error' },
                graduated: { label: 'Lulus', color: 'info' },
                transferred: { label: 'Pindah', color: 'warning' },
            };
            const config = statusConfig[value as keyof typeof statusConfig];
            return (
                <Chip
                    label={config.label}
                    color={config.color as any}
                    size="small"
                />
            );
        }
    },
];

export default function StudentsPage() {
    const [data, setData] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [openForm, setOpenForm] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Student | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAdd = () => {
        setSelectedItem(null);
        setOpenForm(true);
    };

    const handleEdit = (item: Student) => {
        setSelectedItem(item);
        setOpenForm(true);
    };

    const handleView = (item: Student) => {
        setSelectedItem(item);
        setOpenDetail(true);
    };

    const handleDelete = (item: Student) => {
        setSelectedItem(item);
        setOpenDelete(true);
    };

    const handleSave = async (formData: Partial<Student>) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = selectedItem
                ? `http://localhost:3000/api/master/students/${selectedItem.id}`
                : 'http://localhost:3000/api/master/students';
            
            const response = await fetch(url, {
                method: selectedItem ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to save student data');
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
                `http://localhost:3000/api/master/students/${selectedItem.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete student');
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
            const response = await fetch('http://localhost:3000/api/master/students', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch students');
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const renderActions = (item: Student) => (
        <Stack direction="row" spacing={1}>
            <Tooltip title="View Details">
                <IconButton 
                    size="small" 
                    onClick={() => handleView(item)}
                    color="info"
                >
                    <IconEye size={20} />
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
                            <Typography variant="h5">Data Siswa</Typography>
                            <Button
                                variant="contained"
                                startIcon={<IconPlus />}
                                onClick={handleAdd}
                            >
                                Tambah Siswa
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
            <StudentForm
                open={openForm}
                onClose={() => setOpenForm(false)}
                onSave={handleSave}
                data={selectedItem}
                loading={loading}
            />

            {/* Detail Dialog */}
            <StudentDetail
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
                title="Hapus Data Siswa"
                content={`Apakah Anda yakin ingin menghapus data siswa ${selectedItem?.name}?`}
            />
        </PageContainer>
    );
}
