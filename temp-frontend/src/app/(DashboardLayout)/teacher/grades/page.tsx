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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useState, useEffect, SyntheticEvent } from 'react';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { IconPlus, IconUpload, IconDownload } from '@tabler/icons-react';
import GradesList from './components/GradesList';
import GradeInput from './components/GradeInput';
import GradeStatistics from './components/GradeStatistics';

interface Class {
  id: string;
  name: string;
  grade: string;
  subject: string;
}

interface GradeCategory {
  id: string;
  name: string;
  weight: number;
}

export default function GradesPage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [categories, setCategories] = useState<GradeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isInputModalOpen, setInputModalOpen] = useState(false);

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
    const fetchCategories = async () => {
      if (!selectedClass) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:3000/api/teacher/grades/categories?classId=${selectedClass}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch grade categories');
        }

        const data = await response.json();
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategory(data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load grade categories');
      }
    };

    fetchCategories();
  }, [selectedClass]);

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleImportGrades = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('classId', selectedClass);
    formData.append('categoryId', selectedCategory);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/teacher/grades/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to import grades');
      }

      setSuccess('Grades imported successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import grades');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleExportGrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3000/api/teacher/grades/export?classId=${selectedClass}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to export grades');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grades_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export grades');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Loading grades data...</Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Box>
        <Card sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Grade Management</Typography>
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
                      {class_.name} - {class_.subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name} ({category.weight}%)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<IconPlus />}
                onClick={() => setInputModalOpen(true)}
              >
                Add Grades
              </Button>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                id="grade-import"
                onChange={handleImportGrades}
              />
              <label htmlFor="grade-import">
                <Tooltip title="Import Grades">
                  <IconButton component="span" color="primary">
                    <IconUpload />
                  </IconButton>
                </Tooltip>
              </label>
              <Tooltip title="Export Grades">
                <IconButton onClick={handleExportGrades} color="primary">
                  <IconDownload />
                </IconButton>
              </Tooltip>
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
            <Tab label="Grades List" />
            <Tab label="Statistics" />
          </Tabs>

          {selectedTab === 0 && (
            <GradesList
              classId={selectedClass}
              categoryId={selectedCategory}
            />
          )}

          {selectedTab === 1 && (
            <GradeStatistics
              classId={selectedClass}
              categoryId={selectedCategory}
            />
          )}
        </Card>
      </Box>

      <GradeInput
        open={isInputModalOpen}
        onClose={() => setInputModalOpen(false)}
        classId={selectedClass}
        categoryId={selectedCategory}
        onSuccess={() => {
          setSuccess('Grades added successfully');
          setTimeout(() => setSuccess(null), 3000);
        }}
        onError={(message) => {
          setError(message);
          setTimeout(() => setError(null), 3000);
        }}
      />
    </PageContainer>
  );
}
