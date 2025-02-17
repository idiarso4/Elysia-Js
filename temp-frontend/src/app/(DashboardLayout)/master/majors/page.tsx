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
    IconSchool,
} from '@tabler/icons-react';
import CustomTable from '@/app/(DashboardLayout)/components/shared/CustomTable';
import DeleteDialog from '@/app/(DashboardLayout)/components/shared/DeleteDialog';
import MajorForm from './components/MajorForm';
import MajorDetail from './components/MajorDetail';

interface Major {
    id: string;
    name: string;
    code: string;
    description: string;
    headOfDepartment: {
        id: string;
        name: string;
        nip: string;
    };
    totalClasses: number;
    totalStudents: number;
    status: 'active' | 'inactive';
}

const columns = [
    { 
        id: 'code', 
        label: 'Kode',
        width: 100
    },
    { 
        id: 'name', 
        label: 'Nama Jurusan',
        width: 200
    },
    { 
        id: 'headOfDepartment', 
        label: 'Kepala Jurusan',
        width: 200,
        render: (value: Major['headOfDepartment']) => (
            <Stack>
                <Typography variant="body2">{value.name}</Typography>
                <Typography variant="caption" color="textSecondary">NIP: {value.nip}</Typography>
            </Stack>
        )
    },
    { 
        id: 'totalClasses', 
        label: 'Jumlah Kelas',
        width: 120,
        render: (value: number) => (
            <Stack direction="row" spacing={1} alignItems="center">
                <IconSchool size={16} />
                <Typography>{value}</Typography>
            </Stack>
        )
    },
    { 
        id: 'totalStudents', 
        label: 'Jumlah Siswa',
        width: 120,
        render: (value: number) => (
            <Stack direction="row" spacing={1} alignItems="center">
                <IconUsers size={16} />
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

export default function MajorsPage() {
    const [data, setData] = useState<Major[]>([]);
    const [loading, setLoading] = useState(false);
    const [openForm, setOpenForm] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Major | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAdd = () => {
        setSelectedItem(null);
        setOpenForm(true);
    };

    const handleEdit = (item: Major) => {
        setSelectedItem(item);
        setOpenForm(true);
    };

    const handleView = (item: Major) => {
        setSelectedItem(item);
        setOpenDetail(true);
    };

    const handleDelete = (item: Major) => {
        setSelectedItem(item);
        setOpenDelete(true);
    };

    const handleSave = async (formData: Partial<Major>) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = selectedItem
                ? `http://localhost:3000/api/master/majors/${selectedItem.id}`
                : 'http://localhost:3000/api/master/majors';
            
            const response = await fetch(url, {
                method: selectedItem ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to save major');
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
                `http://localhost:3000/api/master/majors/${selectedItem.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete major');
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
            const response = await fetch('http://localhost:3000/api/master/majors', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch majors');
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const renderActions = (item: Major) => (
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
                    disabled={item.totalClasses > 0}
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
                            <Typography variant="h5">Data Jurusan</Typography>
                            <Button
                                variant="contained"
                                startIcon={<IconPlus />}
                                onClick={handleAdd}
                            >
                                Tambah Jurusan
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
            <MajorForm
                open={openForm}
                onClose={() => setOpenForm(false)}
                onSave={handleSave}
                data={selectedItem}
                loading={loading}
            />

            {/* Detail Dialog */}
            <MajorDetail
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
                title="Hapus Jurusan"
                content={`Apakah Anda yakin ingin menghapus jurusan ${selectedItem?.name}?`}
            />
        </PageContainer>
    );
}
