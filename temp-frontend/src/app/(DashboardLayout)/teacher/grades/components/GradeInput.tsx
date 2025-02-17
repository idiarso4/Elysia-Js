'use client';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { IconSave, IconX } from '@tabler/icons-react';
import { useState, useEffect } from 'react';

interface Student {
  id: string;
  name: string;
}

interface GradeInputProps {
  open: boolean;
  onClose: () => void;
  classId: string;
  categoryId: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

interface GradeEntry {
  studentId: string;
  grade: number | null;
  feedback: string;
}

export default function GradeInput({
  open,
  onClose,
  classId,
  categoryId,
  onSuccess,
  onError,
}: GradeInputProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string, GradeEntry>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!classId || !open) return;

      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:3000/api/teacher/classes/${classId}/students`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }

        const data = await response.json();
        setStudents(data);
        
        // Initialize grades object
        const initialGrades: Record<string, GradeEntry> = {};
        data.forEach((student: Student) => {
          initialGrades[student.id] = {
            studentId: student.id,
            grade: null,
            feedback: '',
          };
        });
        setGrades(initialGrades);
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Failed to load students');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classId, open, onClose, onError]);

  const handleGradeChange = (studentId: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 100) return;

    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        grade: numValue,
      },
    }));
  };

  const handleFeedbackChange = (studentId: string, value: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        feedback: value,
      },
    }));
  };

  const handleSave = async () => {
    // Validate that all grades are entered
    const invalidGrades = Object.values(grades).some(g => g.grade === null);
    if (invalidGrades) {
      onError('Please enter grades for all students');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/teacher/grades/bulk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          categoryId,
          grades: Object.values(grades),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save grades');
      }

      onSuccess();
      onClose();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to save grades');
    } finally {
      setSaving(false);
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
        Enter Grades
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell align="center" width={150}>Grade</TableCell>
                  <TableCell>Feedback</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Typography>{student.name}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        value={grades[student.id]?.grade ?? ''}
                        onChange={(e) => handleGradeChange(student.id, e.target.value)}
                        inputProps={{
                          min: 0,
                          max: 100,
                          step: 0.1,
                        }}
                        size="small"
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={grades[student.id]?.feedback ?? ''}
                        onChange={(e) => handleFeedbackChange(student.id, e.target.value)}
                        size="small"
                        fullWidth
                        multiline
                        maxRows={2}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose}
          startIcon={<IconX />}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          startIcon={<IconSave />}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Grades'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
