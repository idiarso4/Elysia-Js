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
    Avatar,
    IconButton,
    FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useEffect, useState, ChangeEvent } from 'react';
import { LoadingButton } from '@mui/lab';
import { IconUpload, IconX } from '@tabler/icons-react';
import { format, parseISO } from 'date-fns';

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

interface StudentFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: Partial<Student>) => Promise<void>;
    data?: Student | null;
    loading?: boolean;
}

const INITIAL_DATA: Partial<Student> = {
    nis: '',
    name: '',
    gender: 'L',
    birthPlace: '',
    birthDate: new Date().toISOString(),
    religion: '',
    address: '',
    phone: '',
    email: '',
    photo: '',
    parentName: '',
    parentPhone: '',
    status: 'active',
};

const RELIGIONS = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];

export default function StudentForm({
    open,
    onClose,
    onSave,
    data,
    loading,
}: StudentFormProps) {
    const [formData, setFormData] = useState<Partial<Student>>(INITIAL_DATA);
    const [errors, setErrors] = useState<Partial<Record<keyof Student, string>>>({});
    const [photoPreview, setPhotoPreview] = useState<string>('');

    useEffect(() => {
        if (data) {
            setFormData(data);
            setPhotoPreview(data.photo);
        } else {
            setFormData(INITIAL_DATA);
            setPhotoPreview('');
        }
        setErrors({});
    }, [data]);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof Student, string>> = {};
        
        if (!formData.nis?.trim()) {
            newErrors.nis = 'NIS harus diisi';
        }
        
        if (!formData.name?.trim()) {
            newErrors.name = 'Nama siswa harus diisi';
        }
        
        if (!formData.birthPlace?.trim()) {
            newErrors.birthPlace = 'Tempat lahir harus diisi';
        }
        
        if (!formData.birthDate) {
            newErrors.birthDate = 'Tanggal lahir harus diisi';
        }
        
        if (!formData.religion?.trim()) {
            newErrors.religion = 'Agama harus diisi';
        }
        
        if (!formData.address?.trim()) {
            newErrors.address = 'Alamat harus diisi';
        }
        
        if (!formData.phone?.trim()) {
            newErrors.phone = 'Nomor telepon harus diisi';
        }
        
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Format email tidak valid';
        }
        
        if (!formData.parentName?.trim()) {
            newErrors.parentName = 'Nama orang tua harus diisi';
        }
        
        if (!formData.parentPhone?.trim()) {
            newErrors.parentPhone = 'Nomor telepon orang tua harus diisi';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        await onSave(formData);
    };

    const handleChange = (field: keyof Student, value: any) => {
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

    const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setPhotoPreview(base64String);
                handleChange('photo', base64String);
            };
            reader.readAsDataURL(file);
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
                {data ? 'Edit Data Siswa' : 'Tambah Siswa'}
            </DialogTitle>
            <DialogContent>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        {/* Photo Upload */}
                        <Grid item xs={12} display="flex" justifyContent="center">
                            <Stack alignItems="center" spacing={2}>
                                <Avatar
                                    src={photoPreview || '/images/profile/user-1.jpg'}
                                    sx={{ width: 100, height: 100 }}
                                />
                                <Button
                                    component="label"
                                    variant="outlined"
                                    startIcon={<IconUpload />}
                                >
                                    Upload Foto
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                    />
                                </Button>
                            </Stack>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                label="NIS"
                                value={formData.nis}
                                onChange={(e) => handleChange('nis', e.target.value)}
                                error={!!errors.nis}
                                helperText={errors.nis}
                                fullWidth
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Nama Lengkap"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                error={!!errors.name}
                                helperText={errors.name}
                                fullWidth
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Jenis Kelamin</InputLabel>
                                <Select
                                    value={formData.gender}
                                    label="Jenis Kelamin"
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                >
                                    <MenuItem value="L">Laki-laki</MenuItem>
                                    <MenuItem value="P">Perempuan</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Tempat Lahir"
                                value={formData.birthPlace}
                                onChange={(e) => handleChange('birthPlace', e.target.value)}
                                error={!!errors.birthPlace}
                                helperText={errors.birthPlace}
                                fullWidth
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <DatePicker
                                label="Tanggal Lahir"
                                value={formData.birthDate ? parseISO(formData.birthDate) : null}
                                onChange={(date: Date | null) => {
                                    if (date) {
                                        handleChange('birthDate', format(date, 'yyyy-MM-dd'));
                                    }
                                }}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        required: true,
                                        error: !!errors.birthDate,
                                        helperText: errors.birthDate,
                                    },
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Agama</InputLabel>
                                <Select
                                    value={formData.religion}
                                    label="Agama"
                                    onChange={(e) => handleChange('religion', e.target.value)}
                                    error={!!errors.religion}
                                >
                                    {RELIGIONS.map((religion) => (
                                        <MenuItem key={religion} value={religion}>
                                            {religion}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.religion && (
                                    <FormHelperText error>{errors.religion}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Alamat"
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                error={!!errors.address}
                                helperText={errors.address}
                                fullWidth
                                required
                                multiline
                                rows={3}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                label="No. HP"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                error={!!errors.phone}
                                helperText={errors.phone}
                                fullWidth
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                error={!!errors.email}
                                helperText={errors.email}
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Nama Orang Tua"
                                value={formData.parentName}
                                onChange={(e) => handleChange('parentName', e.target.value)}
                                error={!!errors.parentName}
                                helperText={errors.parentName}
                                fullWidth
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                label="No. HP Orang Tua"
                                value={formData.parentPhone}
                                onChange={(e) => handleChange('parentPhone', e.target.value)}
                                error={!!errors.parentPhone}
                                helperText={errors.parentPhone}
                                fullWidth
                                required
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
