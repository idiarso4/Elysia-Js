'use client';
import {
  Grid,
  Box,
  Card,
  Typography,
  Stack,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { useState, useEffect, SyntheticEvent } from 'react';
import { IconEdit, IconSave, IconX } from '@tabler/icons-react';

interface Student {
  id: string;
  name: string;
  grade: string;
  attendance?: {
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
  };
}

interface Class {
  id: string;
  name: string;
  grade: string;
}

export default function AttendancePage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState('');

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

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedClass) return;
      
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:3000/api/teacher/attendance?classId=${selectedClass}&date=${selectedDate.toISOString()}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch attendance');
        }

        const data = await response.json();
        setStudents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load attendance');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedClass, selectedDate]);

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleStatusChange = async (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    const updatedStudents = students.map(student => 
      student.id === studentId
        ? { ...student, attendance: { ...student.attendance, status } }
        : student
    );
    setStudents(updatedStudents);

    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3000/api/teacher/attendance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          classId: selectedClass,
          date: selectedDate.toISOString(),
          status,
          notes: students.find(s => s.id === studentId)?.attendance?.notes || '',
        }),
      });

      setSuccess('Attendance updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update attendance');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleNoteEdit = (student: Student) => {
    setEditingStudent(student);
    setCurrentNote(student.attendance?.notes || '');
    setNoteDialogOpen(true);
  };

  const handleNoteSave = async () => {
    if (!editingStudent) return;

    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3000/api/teacher/attendance/notes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: editingStudent.id,
          classId: selectedClass,
          date: selectedDate.toISOString(),
          notes: currentNote,
        }),
      });

      const updatedStudents = students.map(student =>
        student.id === editingStudent.id
          ? { ...student, attendance: { ...student.attendance, notes: currentNote } }
          : student
      );
      setStudents(updatedStudents);
      setSuccess('Note updated successfully');
      setNoteDialogOpen(false);
    } catch (err) {
      setError('Failed to update note');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Loading attendance data...</Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Box>
        <Card sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Attendance Management</Typography>
            <Stack direction="row" spacing={2}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Class</InputLabel>
                <Select
                  value={selectedClass}
                  label="Class"
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  {classes.map((class_) => (
                    <MenuItem key={class_.id} value={class_.id}>
                      {class_.name} - Grade {class_.grade}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={selectedDate}
                  onChange={(newValue) => newValue && setSelectedDate(newValue)}
                />
              </LocalizationProvider>
            </Stack>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="Take Attendance" />
            <Tab label="Attendance History" />
          </Tabs>

          {selectedTab === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>
                        <Select
                          value={student.attendance?.status || 'absent'}
                          onChange={(e) => handleStatusChange(student.id, e.target.value as any)}
                          size="small"
                        >
                          <MenuItem value="present">Present</MenuItem>
                          <MenuItem value="absent">Absent</MenuItem>
                          <MenuItem value="late">Late</MenuItem>
                          <MenuItem value="excused">Excused</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>{student.attendance?.notes || '-'}</TableCell>
                      <TableCell>
                        <Tooltip title="Add/Edit Note">
                          <IconButton onClick={() => handleNoteEdit(student)}>
                            <IconEdit size={20} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {selectedTab === 1 && (
            <Typography variant="body1" color="textSecondary">
              Attendance history view will be implemented here
            </Typography>
          )}
        </Card>
      </Box>

      <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)}>
        <DialogTitle>
          Add/Edit Note for {editingStudent?.name}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Note"
            fullWidth
            multiline
            rows={4}
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)} startIcon={<IconX />}>
            Cancel
          </Button>
          <Button onClick={handleNoteSave} variant="contained" startIcon={<IconSave />}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
