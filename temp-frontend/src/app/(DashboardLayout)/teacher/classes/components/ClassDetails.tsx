'use client';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  LinearProgress,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { IconEdit, IconSave, IconX } from '@tabler/icons-react';
import { useState, useEffect } from 'react';

interface ClassInfo {
  id: string;
  name: string;
  grade: string;
  subject: string;
  description: string;
  totalStudents: number;
  averageAttendance: number;
  averageGrade: number;
  upcomingAssignments: number;
  gradeDistribution: {
    range: string;
    count: number;
  }[];
}

interface ClassDetailsProps {
  classId: string;
  onError: (message: string) => void;
}

export default function ClassDetails({ classId, onError }: ClassDetailsProps) {
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:3000/api/teacher/classes/${classId}/details`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch class details');
        }

        const data = await response.json();
        setClassInfo(data);
        setEditedDescription(data.description);
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Failed to load class details');
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [classId, onError]);

  const handleSaveDescription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3000/api/teacher/classes/${classId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: editedDescription,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update class description');
      }

      setClassInfo(prev => prev ? { ...prev, description: editedDescription } : null);
      setIsEditing(false);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to update class description');
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!classInfo) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No class details available</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Class Description */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Class Description</Typography>
              <Button
                startIcon={<IconEdit />}
                onClick={() => setIsEditing(true)}
                size="small"
              >
                Edit
              </Button>
            </Stack>
            <Typography color="textSecondary">
              {classInfo.description}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Quick Stats */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Students
            </Typography>
            <Typography variant="h4">
              {classInfo.totalStudents}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Average Attendance
            </Typography>
            <Typography 
              variant="h4"
              color={classInfo.averageAttendance >= 90 ? 'success.main' : 'warning.main'}
            >
              {classInfo.averageAttendance}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Average Grade
            </Typography>
            <Typography 
              variant="h4"
              color={classInfo.averageGrade >= 60 ? 'success.main' : 'error.main'}
            >
              {classInfo.averageGrade}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Upcoming Assignments
            </Typography>
            <Typography variant="h4">
              {classInfo.upcomingAssignments}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Grade Distribution Chart */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Grade Distribution
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={classInfo.gradeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Edit Description Dialog */}
      <Dialog 
        open={isEditing} 
        onClose={() => setIsEditing(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Edit Class Description
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsEditing(false)}
            startIcon={<IconX />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveDescription}
            variant="contained"
            startIcon={<IconSave />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
