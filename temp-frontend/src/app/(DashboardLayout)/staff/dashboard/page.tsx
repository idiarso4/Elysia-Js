'use client';
import {
    Grid,
    Box,
    Card,
    Typography,
    Stack,
    Button,
    IconButton,
    Tooltip,
    Chip,
} from '@mui/material';
import { useState, useEffect } from 'react';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { IconDownload, IconPlus } from '@tabler/icons-react';
import TaskList from './components/TaskList';
import AnnouncementList from './components/AnnouncementList';

interface DashboardStats {
    totalStudents: number;
    totalTeachers: number;
    pendingTasks: number;
    todayAttendance: {
        total: number;
        present: number;
        absent: number;
        late: number;
    };
}

export default function StaffDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalStudents: 0,
        totalTeachers: 0,
        pendingTasks: 0,
        todayAttendance: {
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
        },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:3000/api/staff/dashboard', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard stats');
                }

                const data = await response.json();
                setStats(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    if (loading) {
        return (
            <PageContainer>
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography>Loading dashboard data...</Typography>
                </Box>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
                    <Typography>{error}</Typography>
                </Box>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Box>
                <Grid container spacing={3}>
                    {/* Quick Stats */}
                    <Grid item xs={12} sm={6} lg={3}>
                        <DashboardCard
                            title="Total Students"
                            subtitle={stats.totalStudents.toString()}
                            icon="👨‍🎓"
                            color="primary"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                        <DashboardCard
                            title="Total Teachers"
                            subtitle={stats.totalTeachers.toString()}
                            icon="👨‍🏫"
                            color="info"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                        <DashboardCard
                            title="Pending Tasks"
                            subtitle={stats.pendingTasks.toString()}
                            icon="📋"
                            color="warning"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                        <DashboardCard
                            title="Today's Attendance"
                            subtitle={`${Math.round((stats.todayAttendance.present / stats.todayAttendance.total) * 100)}%`}
                            icon="📊"
                            color="success"
                        />
                    </Grid>

                    {/* Tasks Section */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ p: 3, height: '100%' }}>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={3}
                            >
                                <Typography variant="h5">Pending Tasks</Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<IconPlus />}
                                    size="small"
                                >
                                    Add Task
                                </Button>
                            </Stack>
                            <TaskList />
                        </Card>
                    </Grid>

                    {/* Announcements Section */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ p: 3, height: '100%' }}>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={3}
                            >
                                <Typography variant="h5">Recent Announcements</Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<IconPlus />}
                                    size="small"
                                >
                                    New Announcement
                                </Button>
                            </Stack>
                            <AnnouncementList />
                        </Card>
                    </Grid>

                    {/* Today's Attendance Summary */}
                    <Grid item xs={12}>
                        <Card sx={{ p: 3 }}>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={3}
                            >
                                <Typography variant="h5">Today's Attendance Summary</Typography>
                                <Tooltip title="Export Report">
                                    <IconButton>
                                        <IconDownload />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card variant="outlined" sx={{ p: 2 }}>
                                        <Stack alignItems="center" spacing={1}>
                                            <Typography variant="h3" color="success.main">
                                                {stats.todayAttendance.present}
                                            </Typography>
                                            <Chip label="Present" color="success" />
                                        </Stack>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card variant="outlined" sx={{ p: 2 }}>
                                        <Stack alignItems="center" spacing={1}>
                                            <Typography variant="h3" color="error.main">
                                                {stats.todayAttendance.absent}
                                            </Typography>
                                            <Chip label="Absent" color="error" />
                                        </Stack>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card variant="outlined" sx={{ p: 2 }}>
                                        <Stack alignItems="center" spacing={1}>
                                            <Typography variant="h3" color="warning.main">
                                                {stats.todayAttendance.late}
                                            </Typography>
                                            <Chip label="Late" color="warning" />
                                        </Stack>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card variant="outlined" sx={{ p: 2 }}>
                                        <Stack alignItems="center" spacing={1}>
                                            <Typography variant="h3">
                                                {stats.todayAttendance.total}
                                            </Typography>
                                            <Chip label="Total" />
                                        </Stack>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </PageContainer>
    );
}
