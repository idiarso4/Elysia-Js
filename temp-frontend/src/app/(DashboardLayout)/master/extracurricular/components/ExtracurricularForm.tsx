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
} from '@mui/material';
import { useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';

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

interface ExtracurricularFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: Partial<Extracurricular>) => Promise<void>;
    data?: Extracurricular | null;
    loading?: boolean;
}

const INITIAL_DATA: Partial<Extracurricular> = {
    name: '',
    description: '',
    dayTime: '',
    location: '',
    coach: '',
    maxParticipants: 0,
    status: 'active',
};

export default function ExtracurricularForm({
    open,
    onClose,
    onSave,
    data,
    loading,
}: ExtracurricularFormProps) {
    const [formData, setFormData] = useState<Partial<Extracurricular>>(INITIAL_DATA);
    const [errors, setErrors] = useState<Partial<Record<keyof Extracurricular, string>>>({});

    useEffect(() => {
        if (data) {
            setFormData(data);
        } else {
            setFormData(INITIAL_DATA);
        }
        setErrors({});
    }, [data]);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof Extracurricular, string>> = {};
        
        if (!formData.name?.trim()) {
            newErrors.name = 'Nama ekstrakurikuler harus diisi';
        }
        
        if (!formData.description?.trim()) {
            newErrors.description = 'Deskripsi harus diisi';
        }
        
        if (!formData.dayTime?.trim()) {
            newErrors.dayTime = 'Hari & waktu harus diisi';
        }
        
        if (!formData.location?.trim()) {
            newErrors.location = 'Lokasi harus diisi';
        }
        
        if (!formData.coach?.trim()) {
            newErrors.coach = 'Pembina harus diisi';
        }
        
        if (!formData.maxParticipants || formData.maxParticipants <= 0) {
            newErrors.maxParticipants = 'Jumlah maksimal peserta harus lebih dari 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        await onSave(formData);
    };

    const handleChange = (field: keyof Extracurricular, value: any) => {
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
                {data ? 'Edit Ekstrakurikuler' : 'Tambah Ekstrakurikuler'}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField
                            label="Nama Ekstrakurikuler"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            error={!!errors.name}
                            helperText={errors.name}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Deskripsi"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            error={!!errors.description}
                            helperText={errors.description}
                            fullWidth
                            required
                            multiline
                            rows={3}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Hari & Waktu"
                            value={formData.dayTime}
                            onChange={(e) => handleChange('dayTime', e.target.value)}
                            error={!!errors.dayTime}
                            helperText={errors.dayTime}
                            fullWidth
                            required
                            placeholder="Contoh: Senin, 15:00-17:00"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Lokasi"
                            value={formData.location}
                            onChange={(e) => handleChange('location', e.target.value)}
                            error={!!errors.location}
                            helperText={errors.location}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Pembina"
                            value={formData.coach}
                            onChange={(e) => handleChange('coach', e.target.value)}
                            error={!!errors.coach}
                            helperText={errors.coach}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Maksimal Peserta"
                            type="number"
                            value={formData.maxParticipants}
                            onChange={(e) => handleChange('maxParticipants', parseInt(e.target.value))}
                            error={!!errors.maxParticipants}
                            helperText={errors.maxParticipants}
                            fullWidth
                            required
                            inputProps={{ min: 1 }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
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
