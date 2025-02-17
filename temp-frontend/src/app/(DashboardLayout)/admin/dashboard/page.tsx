'use client';
import { Grid, Box, Card, Typography, Stack } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useState, useEffect } from 'react';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalStaff: number;
  attendanceToday: {
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalStaff: 0,
    attendanceToday: {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/admin/dashboard', {
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
          <Grid item xs={12} sm={6} lg={3}>
            <DashboardCard
              title="Total Students"
              subtitle={stats.totalStudents.toString()}
              icon="👨‍🎓"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <DashboardCard
              title="Total Teachers"
              subtitle={stats.totalTeachers.toString()}
              icon="👨‍🏫"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <DashboardCard
              title="Total Staff"
              subtitle={stats.totalStaff.toString()}
              icon="👨‍💼"
            />
          </Grid>
          <Grid item xs={12}>
            <Card>
              <Box sx={{ p: 3 }}>
                <Typography variant="h4" mb={2}>Today's Attendance</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Stack
                      direction="column"
                      spacing={1}
                      alignItems="center"
                      sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}
                    >
                      <Typography variant="h3" color="white">
                        {stats.attendanceToday.present}
                      </Typography>
                      <Typography color="white">Present</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Stack
                      direction="column"
                      spacing={1}
                      alignItems="center"
                      sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1 }}
                    >
                      <Typography variant="h3" color="white">
                        {stats.attendanceToday.absent}
                      </Typography>
                      <Typography color="white">Absent</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Stack
                      direction="column"
                      spacing={1}
                      alignItems="center"
                      sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1 }}
                    >
                      <Typography variant="h3" color="white">
                        {stats.attendanceToday.late}
                      </Typography>
                      <Typography color="white">Late</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Stack
                      direction="column"
                      spacing={1}
                      alignItems="center"
                      sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}
                    >
                      <Typography variant="h3" color="white">
                        {stats.attendanceToday.excused}
                      </Typography>
                      <Typography color="white">Excused</Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
