'use client';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Typography,
    Stack,
    Chip,
    Divider,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
} from '@mui/material';
import {
    IconUsers,
    IconChalkboard,
    IconCalendar,
    IconSchool,
    IconUserCheck,
} from '@tabler/icons-react';

interface Student {
    id: string;
    nis: string;
    name: string;
    gender: 'L' | 'P';
    photo: string;
}

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
    students?: Student[];
}

interface ClassDetailProps {
    open: boolean;
    onClose: () => void;
    data: Class | null;
}

export default function ClassDetail({
    open,
    onClose,
    data,
}: ClassDetailProps) {
    if (!data) return null;

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
                Detail Kelas
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={3}>
                    {/* Header Section */}
                    <Grid item xs={12}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ py: 2 }}
                        >
                            <Stack spacing={1}>
                                <Typography variant="h5">
                                    Kelas {data.name}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {data.major.name}
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <Chip
                                        label={`Tingkat ${data.grade}`}
                                        color="primary"
                                        size="small"
                                    />
                                    <Chip
                                        label={data.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                        color={data.status === 'active' ? 'success' : 'default'}
                                        size="small"
                                    />
                                </Stack>
                            </Stack>
                            <Box textAlign="right">
                                <Typography variant="h6">
                                    {data.studentCount}/{data.capacity}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Jumlah Siswa
                                </Typography>
                            </Box>
                        </Stack>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider />
                    </Grid>

                    {/* Class Information */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            Informasi Kelas
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Stack spacing={2}>
                                    <InfoItem
                                        icon={IconChalkboard}
                                        label="Ruangan"
                                        value={data.room}
                                    />
                                    <InfoItem
                                        icon={IconCalendar}
                                        label="Tahun Ajaran"
                                        value={`${data.academicYear.year} - ${data.academicYear.semester}`}
                                    />
                                    <InfoItem
                                        icon={IconSchool}
                                        label="Jurusan"
                                        value={data.major.name}
                                    />
                                </Stack>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Stack spacing={2}>
                                    <InfoItem
                                        icon={IconUserCheck}
                                        label="Wali Kelas"
                                        value={`${data.teacher.name} (NIP: ${data.teacher.nip})`}
                                    />
                                    <InfoItem
                                        icon={IconUsers}
                                        label="Kapasitas"
                                        value={`${data.studentCount} dari ${data.capacity} siswa`}
                                    />
                                </Stack>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider />
                    </Grid>

                    {/* Student List */}
                    <Grid item xs={12}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mb: 2 }}
                        >
                            <Typography variant="subtitle1" fontWeight={600}>
                                Daftar Siswa
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Total: {data.students?.length || 0} siswa
                            </Typography>
                        </Stack>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Foto</TableCell>
                                        <TableCell>NIS</TableCell>
                                        <TableCell>Nama Siswa</TableCell>
                                        <TableCell>JK</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.students?.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell>
                                                <Avatar
                                                    src={student.photo || '/images/profile/user-1.jpg'}
                                                    sx={{ width: 32, height: 32 }}
                                                />
                                            </TableCell>
                                            <TableCell>{student.nis}</TableCell>
                                            <TableCell>{student.name}</TableCell>
                                            <TableCell>
                                                {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!data.students || data.students.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                <Typography color="textSecondary">
                                                    Belum ada siswa
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
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
