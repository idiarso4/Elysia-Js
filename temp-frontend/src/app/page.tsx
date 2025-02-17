'use client';
import {
    Box,
    Button,
    Container,
    Grid,
    Typography,
    Stack,
    Card,
    CardContent,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import {
    IconBrandGithub,
    IconSchool,
    IconUsers,
    IconBook,
    IconChartBar,
    IconCalendarStats,
    IconClipboardCheck,
} from '@tabler/icons-react';

const features = [
    {
        icon: IconSchool,
        title: 'Manajemen Kelas',
        description: 'Kelola kelas dengan mudah, termasuk jadwal, absensi, dan nilai siswa.',
    },
    {
        icon: IconUsers,
        title: 'Data Siswa & Guru',
        description: 'Kelola informasi lengkap siswa dan guru dalam satu platform.',
    },
    {
        icon: IconBook,
        title: 'Jurnal Mengajar',
        description: 'Dokumentasi kegiatan belajar mengajar yang terstruktur.',
    },
    {
        icon: IconChartBar,
        title: 'Laporan & Analisis',
        description: 'Visualisasi data dan analisis untuk pengambilan keputusan.',
    },
    {
        icon: IconCalendarStats,
        title: 'Kehadiran Digital',
        description: 'Sistem absensi digital dengan QR Code dan lokasi.',
    },
    {
        icon: IconClipboardCheck,
        title: 'Penilaian Siswa',
        description: 'Sistem penilaian yang komprehensif dan transparan.',
    },
];

const testimonials = [
    {
        content: 'Sistem ini sangat membantu kami dalam mengelola data siswa dan kegiatan akademik.',
        author: 'Ahmad Fauzi',
        role: 'Kepala Sekolah',
        avatar: '/images/profile/user-1.jpg',
    },
    {
        content: 'Proses pencatatan jurnal mengajar dan absensi menjadi lebih efisien.',
        author: 'Siti Aminah',
        role: 'Guru Matematika',
        avatar: '/images/profile/user-2.jpg',
    },
    {
        content: 'Dashboard yang informatif memudahkan monitoring perkembangan siswa.',
        author: 'Budi Santoso',
        role: 'Wali Kelas',
        avatar: '/images/profile/user-3.jpg',
    },
];

export default function LandingPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Box>
            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    color: 'white',
                    pt: { xs: 10, md: 20 },
                    pb: { xs: 10, md: 20 },
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography variant="h2" fontWeight="bold" gutterBottom>
                                Student Management System
                            </Typography>
                            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                                Solusi modern untuk pengelolaan data akademik yang efisien dan terintegrasi
                            </Typography>
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    color="secondary"
                                    component={Link}
                                    href="/authentication/login"
                                >
                                    Masuk Sekarang
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    sx={{ color: 'white', borderColor: 'white' }}
                                    startIcon={<IconBrandGithub />}
                                    href="https://github.com/yourusername/project"
                                    target="_blank"
                                >
                                    Source Code
                                </Button>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ position: 'relative', height: isMobile ? '300px' : '500px' }}>
                                <Image
                                    src="/images/backgrounds/dashboard-preview.png"
                                    alt="Dashboard Preview"
                                    fill
                                    style={{ objectFit: 'contain' }}
                                    priority
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Features Section */}
            <Box sx={{ py: { xs: 8, md: 12 } }}>
                <Container maxWidth="lg">
                    <Typography
                        variant="h3"
                        align="center"
                        gutterBottom
                        sx={{ mb: 6 }}
                    >
                        Fitur Unggulan
                    </Typography>
                    <Grid container spacing={4}>
                        {features.map((feature, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Stack spacing={2}>
                                            <feature.icon size={40} color={theme.palette.primary.main} />
                                            <Typography variant="h6">
                                                {feature.title}
                                            </Typography>
                                            <Typography color="textSecondary">
                                                {feature.description}
                                            </Typography>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Testimonials Section */}
            <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'grey.50' }}>
                <Container maxWidth="lg">
                    <Typography
                        variant="h3"
                        align="center"
                        gutterBottom
                        sx={{ mb: 6 }}
                    >
                        Testimoni Pengguna
                    </Typography>
                    <Grid container spacing={4}>
                        {testimonials.map((testimonial, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Stack spacing={3}>
                                            <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                                                "{testimonial.content}"
                                            </Typography>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Image
                                                    src={testimonial.avatar}
                                                    alt={testimonial.author}
                                                    width={50}
                                                    height={50}
                                                    style={{ borderRadius: '50%' }}
                                                />
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {testimonial.author}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {testimonial.role}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ py: 4, bgcolor: 'grey.900', color: 'white' }}>
                <Container maxWidth="lg">
                    <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                        <Grid item>
                            <Typography variant="body2">
                                © 2025 Student Management System. All rights reserved.
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Stack direction="row" spacing={2}>
                                <Link href="/privacy" style={{ color: 'white' }}>
                                    Privacy Policy
                                </Link>
                                <Link href="/terms" style={{ color: 'white' }}>
                                    Terms of Service
                                </Link>
                                <Link href="/contact" style={{ color: 'white' }}>
                                    Contact Us
                                </Link>
                            </Stack>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
}
