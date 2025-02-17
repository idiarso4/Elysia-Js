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
  Tabs,
  Tab,
} from '@mui/material';
import { useState, useEffect, SyntheticEvent } from 'react';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { IconPlus, IconDownload } from '@tabler/icons-react';
import ClassList from './components/ClassList';
import ClassDetails from './components/ClassDetails';
import ClassSchedule from './components/ClassSchedule';
import StudentList from './components/StudentList';

interface Class {
  id: string;
  name: string;
  grade: string;
  subject: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
    room: string;
  }[];
  totalStudents: number;
}

export default function ClassesPage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/teacher/classes', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch classes');
        }

        const data = await response.json();
        setClasses(data);
        if (data.length > 0) {
          setSelectedClass(data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load classes');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleExportData = async () => {
    if (!selectedClass) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3000/api/teacher/classes/${selectedClass}/export`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to export class data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `class_data_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export class data');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Loading class data...</Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Box>
        <Grid container spacing={3}>
          {/* Class List */}
          <Grid item xs={12} md={4} lg={3}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Stack spacing={3}>
                <Typography variant="h5">My Classes</Typography>
                <ClassList
                  classes={classes}
                  selectedClass={selectedClass}
                  onSelectClass={setSelectedClass}
                />
                <Button
                  variant="contained"
                  startIcon={<IconPlus />}
                  fullWidth
                >
                  Request New Class
                </Button>
              </Stack>
            </Card>
          </Grid>

          {/* Class Details and Management */}
          <Grid item xs={12} md={8} lg={9}>
            <Card sx={{ p: 3 }}>
              {selectedClass ? (
                <>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                  >
                    <Typography variant="h5">
                      {classes.find(c => c.id === selectedClass)?.name}
                    </Typography>
                    <Tooltip title="Export Class Data">
                      <IconButton onClick={handleExportData} color="primary">
                        <IconDownload />
                      </IconButton>
                    </Tooltip>
                  </Stack>

                  <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
                    <Tab label="Overview" />
                    <Tab label="Students" />
                    <Tab label="Schedule" />
                  </Tabs>

                  {selectedTab === 0 && (
                    <ClassDetails
                      classId={selectedClass}
                      onError={(message) => setError(message)}
                    />
                  )}

                  {selectedTab === 1 && (
                    <StudentList
                      classId={selectedClass}
                      onError={(message) => setError(message)}
                    />
                  )}

                  {selectedTab === 2 && (
                    <ClassSchedule
                      classId={selectedClass}
                      onError={(message) => setError(message)}
                    />
                  )}
                </>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="textSecondary">
                    Select a class to view details
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
