'use client';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Typography,
    Avatar,
    Stack,
    Chip,
    Divider,
    Box,
} from '@mui/material';
import {
    IconUser,
    IconCalendar,
    IconMapPin,
    IconPhone,
    IconMail,
    IconSchool,
    IconUsers,
} from '@tabler/icons-react';

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

interface StudentDetailProps {
    open: boolean;
    onClose: () => void;
    data: Student | null;
}

export default function StudentDetail({
    open,
    onClose,
    data,
}: StudentDetailProps) {
    if (!data) return null;

    const getStatusColor = (status: string) => {
        const statusConfig = {
            active: 'success',
            inactive: 'error',
            graduated: 'info',
            transferred: 'warning',
        };
        return statusConfig[status as keyof typeof statusConfig];
    };

    const getStatusLabel = (status: string) => {
        const statusLabels = {
            active: 'Aktif',
            inactive: 'Nonaktif',
            graduated: 'Lulus',
            transferred: 'Pindah',
        };
        return statusLabels[status as keyof typeof statusLabels];
    };

    const InfoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
        <Stack direction="row" spacing={2} alignItems="center">
            <Icon size={20} />
            <Box>
                <Typography variant="caption" color="textSecondary">
                    {label}
                </Typography>
                <Typography>
                    {value}
                </Typography>
            </Box>
        </Stack>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                Detail Siswa
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={3}>
                    {/* Header Section */}
                    <Grid item xs={12}>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={3}
                            alignItems="center"
                            sx={{ py: 2 }}
                        >
                            <Avatar
                                src={data.photo || '/images/profile/user-1.jpg'}
                                sx={{ width: 120, height: 120 }}
                            />
                            <Stack spacing={1}>
                                <Typography variant="h5">
                                    {data.name}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    NIS: {data.nis}
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <Chip
                                        label={`Kelas ${data.class.name} - ${data.class.grade}`}
                                        color="primary"
                                        size="small"
                                    />
                                    <Chip
                                        label={getStatusLabel(data.status)}
                                        color={getStatusColor(data.status) as any}
                                        size="small"
                                    />
                                </Stack>
                            </Stack>
                        </Stack>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider />
                    </Grid>

                    {/* Personal Information */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            Informasi Pribadi
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Stack spacing={2}>
                                    <InfoItem
                                        icon={IconUser}
                                        label="Jenis Kelamin"
                                        value={data.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                    />
                                    <InfoItem
                                        icon={IconCalendar}
                                        label="Tempat, Tanggal Lahir"
                                        value={`${data.birthPlace}, ${new Date(data.birthDate).toLocaleDateString('id-ID')}`}
                                    />
                                    <InfoItem
                                        icon={IconSchool}
                                        label="Agama"
                                        value={data.religion}
                                    />
                                </Stack>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Stack spacing={2}>
                                    <InfoItem
                                        icon={IconMapPin}
                                        label="Alamat"
                                        value={data.address}
                                    />
                                    <InfoItem
                                        icon={IconPhone}
                                        label="No. HP"
                                        value={data.phone}
                                    />
                                    <InfoItem
                                        icon={IconMail}
                                        label="Email"
                                        value={data.email || '-'}
                                    />
                                </Stack>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider />
                    </Grid>

                    {/* Parent Information */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            Informasi Orang Tua
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Stack spacing={2}>
                                    <InfoItem
                                        icon={IconUsers}
                                        label="Nama Orang Tua"
                                        value={data.parentName}
                                    />
                                    <InfoItem
                                        icon={IconPhone}
                                        label="No. HP Orang Tua"
                                        value={data.parentPhone}
                                    />
                                </Stack>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>
                    Tutup
                </Button>
            </DialogActions>
        </Dialog>
    );
}
