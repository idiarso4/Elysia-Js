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
} from '@mui/material';
import { useState } from 'react';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';
import CustomTable from '@/app/(DashboardLayout)/components/shared/CustomTable';
import DeleteDialog from '@/app/(DashboardLayout)/components/shared/DeleteDialog';
import ExtracurricularForm from './components/ExtracurricularForm';

interface Extracurricular {
    id: string;
    name: string;
    description: string;
    dayTime: string;
    location: string;
    coach: string;
    maxParticipants: number;
    status: 'active' | 'inactive';
}

const columns = [
    { 
        id: 'name', 
        label: 'Nama Ekstrakurikuler',
        width: 200
    },
    { 
        id: 'description', 
        label: 'Deskripsi',
        width: 300
    },
    { 
        id: 'dayTime', 
        label: 'Hari & Waktu',
        width: 150
    },
    { 
        id: 'location', 
        label: 'Lokasi',
        width: 150
    },
    { 
        id: 'coach', 
        label: 'Pembina',
        width: 150
    },
    { 
        id: 'maxParticipants', 
        label: 'Maks. Peserta',
        width: 120,
        align: 'right' as const
    },
    { 
        id: 'status', 
        label: 'Status',
        width: 100,
        render: (value: string) => (
            <Box
                sx={{
                    backgroundColor: value === 'active' ? 'success.light' : 'error.light',
                    color: value === 'active' ? 'success.dark' : 'error.dark',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    display: 'inline-block',
                }}
            >
                {value === 'active' ? 'Aktif' : 'Nonaktif'}
            </Box>
        )
    },
];

export default function ExtracurricularPage() {
    const [data, setData] = useState<Extracurricular[]>([]);
    const [loading, setLoading] = useState(false);
    const [openForm, setOpenForm] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Extracurricular | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAdd = () => {
        setSelectedItem(null);
        setOpenForm(true);
    };

    const handleEdit = (item: Extracurricular) => {
        setSelectedItem(item);
        setOpenForm(true);
    };

    const handleDelete = (item: Extracurricular) => {
        setSelectedItem(item);
        setOpenDelete(true);
    };

    const handleSave = async (formData: Partial<Extracurricular>) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = selectedItem
                ? `http://localhost:3000/api/master/extracurricular/${selectedItem.id}`
                : 'http://localhost:3000/api/master/extracurricular';
            
            const response = await fetch(url, {
                method: selectedItem ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to save extracurricular');
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
                `http://localhost:3000/api/master/extracurricular/${selectedItem.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete extracurricular');
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
            const response = await fetch('http://localhost:3000/api/master/extracurricular', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch extracurricular data');
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const renderActions = (item: Extracurricular) => (
        <Stack direction="row" spacing={1}>
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
                            <Typography variant="h5">Data Ekstrakurikuler</Typography>
                            <Button
                                variant="contained"
                                startIcon={<IconPlus />}
                                onClick={handleAdd}
                            >
                                Tambah Ekstrakurikuler
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
            <ExtracurricularForm
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
                title="Delete Extracurricular"
                content={`Are you sure you want to delete ${selectedItem?.name}?`}
            />
        </PageContainer>
    );
}
