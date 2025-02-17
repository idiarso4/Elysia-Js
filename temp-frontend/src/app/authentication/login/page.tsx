'use client';
import {
    Grid,
    Box,
    Card,
    Typography,
    Stack,
    Alert,
    CircularProgress,
} from '@mui/material';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, FormEvent, ChangeEvent } from 'react';
import CustomTextField from '@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField';
import { LoadingButton } from '@mui/lab';
import Image from 'next/image';

interface LoginResponse {
    token: string;
    user: {
        id: string;
        username: string;
        role: string;
        name: string;
        email: string;
        nip: string;
    };
}

export default function Login() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                }),
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login gagal');
            }

            // Save auth data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect based on role
            const role = data.user.role;
            let redirectPath = '/';

            switch (role) {
                case 'admin':
                    redirectPath = '/dashboard/admin';
                    break;
                case 'teacher':
                    redirectPath = '/dashboard/teacher';
                    break;
                case 'staff':
                    redirectPath = '/dashboard/staff';
                    break;
            }

            // Use the from parameter if available, otherwise use role-based redirect
            const from = searchParams.get('from');
            router.push(from || redirectPath);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal login');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value,
        }));
    };

    return (
        <Box
            sx={{
                position: 'relative',
                '&:before': {
                    content: '""',
                    background: 'radial-gradient(#d2f1df, #d3d7fa, #bad8f4)',
                    backgroundSize: '400% 400%',
                    animation: 'gradient 15s ease infinite',
                    position: 'absolute',
                    height: '100%',
                    width: '100%',
                    opacity: '0.3',
                },
            }}
        >
            <Grid
                container
                spacing={0}
                justifyContent="center"
                sx={{ height: '100vh' }}
            >
                <Grid
                    item
                    xs={12}
                    sm={8}
                    lg={4}
                    display="flex"
                    alignItems="center"
                >
                    <Card
                        elevation={9}
                        sx={{ p: 4, zIndex: 1, width: '100%', maxWidth: '500px' }}
                    >
                        <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
                            <Image
                                src="/images/logos/dark-logo.svg"
                                alt="Logo"
                                width={200}
                                height={50}
                                priority
                            />
                        </Box>
                        <Stack spacing={3}>
                            <Box>
                                <Typography
                                    variant="h4"
                                    fontWeight="700"
                                    textAlign="center"
                                    mb={1}
                                >
                                    Selamat Datang!
                                </Typography>
                                <Typography
                                    variant="subtitle1"
                                    textAlign="center"
                                    color="textSecondary"
                                    mb={2}
                                >
                                    Masuk untuk melanjutkan ke Student Management System
                                </Typography>
                            </Box>

                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit}>
                                <Stack spacing={3}>
                                    <CustomTextField
                                        id="username"
                                        label="Username"
                                        variant="outlined"
                                        fullWidth
                                        value={formData.username}
                                        onChange={handleChange}
                                        disabled={loading}
                                        required
                                    />

                                    <CustomTextField
                                        id="password"
                                        label="Password"
                                        type="password"
                                        variant="outlined"
                                        fullWidth
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={loading}
                                        required
                                    />

                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        justifyContent="space-between"
                                    >
                                        <Typography
                                            component={Link}
                                            href="/authentication/forgot-password"
                                            fontWeight="500"
                                            sx={{
                                                textDecoration: 'none',
                                                color: 'primary.main',
                                            }}
                                        >
                                            Lupa Password?
                                        </Typography>
                                    </Stack>
                                </Stack>

                                <LoadingButton
                                    type="submit"
                                    loading={loading}
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    sx={{ mt: 3 }}
                                >
                                    Masuk
                                </LoadingButton>
                            </form>
                        </Stack>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
