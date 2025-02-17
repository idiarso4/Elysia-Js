'use client';
import { Grid, Box, Card, Typography, Stack, Button, Chip } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ClassStats {
  totalStudents: number;
  attendanceToday: {
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
}

interface UpcomingClass {
  id: string;
  subject: string;
  grade: string;
  time: string;
  room: string;
}

interface RecentSubmission {
  id: string;
  studentName: string;
  subject: string;
  submittedAt: string;
  grade: string | null;
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState<ClassStats>({
    totalStudents: 0,
    attendanceToday: {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    },
  });

  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeacherDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/teacher/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setStats(data.stats);
        setUpcomingClasses(data.upcomingClasses);
        setRecentSubmissions(data.recentSubmissions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherDashboard();
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
          {/* Total Students Card */}
          <Grid item xs={12} sm={6} lg={3}>
            <DashboardCard
              title="Total Students"
              subtitle={stats.totalStudents.toString()}
              icon="👨‍🎓"
              color="primary"
            />
          </Grid>

          {/* Attendance Stats */}
          <Grid item xs={12} sm={6} lg={3}>
            <DashboardCard
              title="Present Today"
              subtitle={stats.attendanceToday.present.toString()}
              icon="✅"
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <DashboardCard
              title="Absent Today"
              subtitle={stats.attendanceToday.absent.toString()}
              icon="❌"
              color="error"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <DashboardCard
              title="Late Today"
              subtitle={stats.attendanceToday.late.toString()}
              icon="⏰"
              color="warning"
            />
          </Grid>

          {/* Upcoming Classes */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Upcoming Classes</Typography>
                <Button component={Link} href="/teacher/schedule" variant="outlined">
                  View Schedule
                </Button>
              </Stack>
              <Stack spacing={2}>
                {upcomingClasses.map((class_) => (
                  <Card key={class_.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="h6">{class_.subject}</Typography>
                        <Typography color="textSecondary">
                          Grade {class_.grade} • Room {class_.room}
                        </Typography>
                      </Box>
                      <Chip label={class_.time} color="primary" />
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Card>
          </Grid>

          {/* Recent Submissions */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Recent Submissions</Typography>
                <Button component={Link} href="/teacher/submissions" variant="outlined">
                  View All
                </Button>
              </Stack>
              <Stack spacing={2}>
                {recentSubmissions.map((submission) => (
                  <Card key={submission.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="h6">{submission.studentName}</Typography>
                        <Typography color="textSecondary">
                          {submission.subject} • {new Date(submission.submittedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      {submission.grade ? (
                        <Chip label={`Grade: ${submission.grade}`} color="success" />
                      ) : (
                        <Chip label="Pending" color="warning" />
                      )}
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
