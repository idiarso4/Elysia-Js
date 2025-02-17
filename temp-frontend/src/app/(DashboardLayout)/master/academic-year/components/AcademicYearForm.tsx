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
    FormControlLabel,
    Switch,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';

interface AcademicYear {
    id: string;
    year: string;
    semester: 'ganjil' | 'genap';
    startDate: string;
    endDate: string;
    isActive: boolean;
}

interface AcademicYearFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: Partial<AcademicYear>) => Promise<void>;
    data?: AcademicYear | null;
    loading?: boolean;
}

const INITIAL_DATA: Partial<AcademicYear> = {
    year: '',
    semester: 'ganjil',
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    isActive: false,
};

export default function AcademicYearForm({
    open,
    onClose,
    onSave,
    data,
    loading,
}: AcademicYearFormProps) {
    const [formData, setFormData] = useState<Partial<AcademicYear>>(INITIAL_DATA);
    const [errors, setErrors] = useState<Partial<Record<keyof AcademicYear, string>>>({});

    useEffect(() => {
        if (data) {
            setFormData(data);
        } else {
            setFormData(INITIAL_DATA);
        }
        setErrors({});
    }, [data]);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof AcademicYear, string>> = {};
        
        if (!formData.year?.trim()) {
            newErrors.year = 'Tahun ajaran harus diisi';
        } else if (!/^\d{4}\/\d{4}$/.test(formData.year)) {
            newErrors.year = 'Format tahun ajaran harus YYYY/YYYY';
        }
        
        if (!formData.semester) {
            newErrors.semester = 'Semester harus dipilih';
        }
        
        if (!formData.startDate) {
            newErrors.startDate = 'Tanggal mulai harus diisi';
        }
        
        if (!formData.endDate) {
            newErrors.endDate = 'Tanggal selesai harus diisi';
        }
        
        if (formData.startDate && formData.endDate && 
            new Date(formData.startDate) >= new Date(formData.endDate)) {
            newErrors.endDate = 'Tanggal selesai harus lebih besar dari tanggal mulai';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        await onSave(formData);
    };

    const handleChange = (field: keyof AcademicYear, value: any) => {
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
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                {data ? 'Edit Tahun Pelajaran' : 'Tambah Tahun Pelajaran'}
            </DialogTitle>
            <DialogContent>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                label="Tahun Ajaran"
                                value={formData.year}
                                onChange={(e) => handleChange('year', e.target.value)}
                                error={!!errors.year}
                                helperText={errors.year || 'Format: YYYY/YYYY (contoh: 2024/2025)'}
                                fullWidth
                                required
                                placeholder="2024/2025"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Semester</InputLabel>
                                <Select
                                    value={formData.semester}
                                    label="Semester"
                                    onChange={(e) => handleChange('semester', e.target.value)}
                                    error={!!errors.semester}
                                >
                                    <MenuItem value="ganjil">Ganjil</MenuItem>
                                    <MenuItem value="genap">Genap</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <DatePicker
                                label="Tanggal Mulai"
                                value={formData.startDate ? new Date(formData.startDate) : null}
                                onChange={(date) => handleChange('startDate', date?.toISOString())}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        required: true,
                                        error: !!errors.startDate,
                                        helperText: errors.startDate,
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <DatePicker
                                label="Tanggal Selesai"
                                value={formData.endDate ? new Date(formData.endDate) : null}
                                onChange={(date) => handleChange('endDate', date?.toISOString())}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        required: true,
                                        error: !!errors.endDate,
                                        helperText: errors.endDate,
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isActive}
                                        onChange={(e) => handleChange('isActive', e.target.checked)}
                                        disabled={data?.isActive} // Can't deactivate current active year
                                    />
                                }
                                label="Set sebagai tahun ajaran aktif"
                            />
                        </Grid>
                    </Grid>
                </LocalizationProvider>
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
