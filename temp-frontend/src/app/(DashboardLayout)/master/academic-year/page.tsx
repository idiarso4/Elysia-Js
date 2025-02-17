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
import { IconPlus, IconPencil, IconTrash, IconStar } from '@tabler/icons-react';
import CustomTable from '@/app/(DashboardLayout)/components/shared/CustomTable';
import DeleteDialog from '@/app/(DashboardLayout)/components/shared/DeleteDialog';
import AcademicYearForm from './components/AcademicYearForm';

interface AcademicYear {
    id: string;
    year: string;
    semester: 'ganjil' | 'genap';
    startDate: string;
    endDate: string;
    isActive: boolean;
}

const columns = [
    { 
        id: 'year', 
        label: 'Tahun Ajaran',
        width: 150,
        render: (value: string, row: AcademicYear) => (
            <Stack direction="row" spacing={1} alignItems="center">
                {row.isActive && (
                    <Tooltip title="Aktif">
                        <IconStar size={20} color="#FFD700" fill="#FFD700" />
                    </Tooltip>
                )}
                <Typography>{value}</Typography>
            </Stack>
        )
    },
    { 
        id: 'semester', 
        label: 'Semester',
        width: 120,
        render: (value: string) => (
            value.charAt(0).toUpperCase() + value.slice(1)
        )
    },
    { 
        id: 'startDate', 
        label: 'Tanggal Mulai',
        width: 150,
        render: (value: string) => new Date(value).toLocaleDateString('id-ID')
    },
    { 
        id: 'endDate', 
        label: 'Tanggal Selesai',
        width: 150,
        render: (value: string) => new Date(value).toLocaleDateString('id-ID')
    },
    { 
        id: 'isActive', 
        label: 'Status',
        width: 120,
        render: (value: boolean) => (
            <Chip
                label={value ? 'Aktif' : 'Nonaktif'}
                color={value ? 'success' : 'default'}
                size="small"
            />
        )
    },
];

export default function AcademicYearPage() {
    const [data, setData] = useState<AcademicYear[]>([]);
    const [loading, setLoading] = useState(false);
    const [openForm, setOpenForm] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedItem, setSelectedItem] = useState<AcademicYear | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAdd = () => {
        setSelectedItem(null);
        setOpenForm(true);
    };

    const handleEdit = (item: AcademicYear) => {
        setSelectedItem(item);
        setOpenForm(true);
    };

    const handleDelete = (item: AcademicYear) => {
        setSelectedItem(item);
        setOpenDelete(true);
    };

    const handleSetActive = async (item: AcademicYear) => {
        if (item.isActive) return; // Already active

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:3000/api/master/academic-year/${item.id}/activate`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to set active academic year');
            }

            // Refresh data
            fetchData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (formData: Partial<AcademicYear>) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = selectedItem
                ? `http://localhost:3000/api/master/academic-year/${selectedItem.id}`
                : 'http://localhost:3000/api/master/academic-year';
            
            const response = await fetch(url, {
                method: selectedItem ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to save academic year');
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
                `http://localhost:3000/api/master/academic-year/${selectedItem.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete academic year');
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
            const response = await fetch('http://localhost:3000/api/master/academic-year', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch academic years');
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const renderActions = (item: AcademicYear) => (
        <Stack direction="row" spacing={1}>
            {!item.isActive && (
                <Tooltip title="Set as Active">
                    <IconButton 
                        size="small" 
                        onClick={() => handleSetActive(item)}
                        color="success"
                    >
                        <IconStar size={20} />
                    </IconButton>
                </Tooltip>
            )}
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
                    disabled={item.isActive}
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
                            <Typography variant="h5">Data Tahun Pelajaran</Typography>
                            <Button
                                variant="contained"
                                startIcon={<IconPlus />}
                                onClick={handleAdd}
                            >
                                Tambah Tahun Pelajaran
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
            <AcademicYearForm
                open={openForm}
                onClose={() => setOpenForm(false)}
                onSave={handleSave}
                data={selectedItem}
                loading={loading}
            />

            {/* Delete Confirmation */}
            <DeleteDialog
                open={openDelete}
                onClose={() => setOpenDelete(false)}
                onConfirm={handleConfirmDelete}
                loading={loading}
                title="Hapus Tahun Pelajaran"
                content={`Apakah Anda yakin ingin menghapus tahun pelajaran ${selectedItem?.year} semester ${selectedItem?.semester}?`}
            />
        </PageContainer>
    );
}
