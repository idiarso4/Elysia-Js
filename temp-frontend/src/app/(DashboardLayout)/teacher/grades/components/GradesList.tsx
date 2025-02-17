'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
} from '@mui/material';
import { IconEdit, IconSave, IconX } from '@tabler/icons-react';
import { useState, useEffect } from 'react';

interface StudentGrade {
  id: string;
  studentId: string;
  studentName: string;
  grade: number;
  feedback?: string;
  submittedAt?: string;
  updatedAt: string;
}

interface GradesListProps {
  classId: string;
  categoryId: string;
}

export default function GradesList({ classId, categoryId }: GradesListProps) {
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingGrade, setEditingGrade] = useState<StudentGrade | null>(null);
  const [newGrade, setNewGrade] = useState<number | ''>('');
  const [newFeedback, setNewFeedback] = useState('');

  useEffect(() => {
    const fetchGrades = async () => {
      if (!classId || !categoryId) return;

      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:3000/api/teacher/grades?classId=${classId}&categoryId=${categoryId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch grades');
        }

        const data = await response.json();
        setGrades(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load grades');
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [classId, categoryId]);

  const handleEditClick = (grade: StudentGrade) => {
    setEditingGrade(grade);
    setNewGrade(grade.grade);
    setNewFeedback(grade.feedback || '');
  };

  const handleSave = async () => {
    if (!editingGrade || newGrade === '') return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3000/api/teacher/grades/${editingGrade.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grade: newGrade,
            feedback: newFeedback,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update grade');
      }

      const updatedGrade = await response.json();
      setGrades(grades.map(g => 
        g.id === editingGrade.id ? updatedGrade : g
      ));
      setEditingGrade(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update grade');
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading grades...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell align="center">Grade</TableCell>
              <TableCell>Feedback</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {grades.map((grade) => (
              <TableRow key={grade.id}>
                <TableCell>{grade.studentName}</TableCell>
                <TableCell align="center">
                  <Typography
                    color={grade.grade >= 60 ? 'success.main' : 'error.main'}
                    fontWeight="bold"
                  >
                    {grade.grade}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      maxWidth: 300,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {grade.feedback || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {new Date(grade.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit Grade">
                    <IconButton onClick={() => handleEditClick(grade)}>
                      <IconEdit size={20} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={!!editingGrade} 
        onClose={() => setEditingGrade(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Edit Grade for {editingGrade?.studentName}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Grade"
              type="number"
              value={newGrade}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value) && value >= 0 && value <= 100) {
                  setNewGrade(value);
                }
              }}
              inputProps={{
                min: 0,
                max: 100,
                step: 0.1,
              }}
              fullWidth
            />
            <TextField
              label="Feedback"
              multiline
              rows={4}
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditingGrade(null)}
            startIcon={<IconX />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            variant="contained"
            startIcon={<IconSave />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
