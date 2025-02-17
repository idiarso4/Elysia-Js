'use client';
import {
  List,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  TextField,
  InputAdornment,
  Box,
  Typography,
} from '@mui/material';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';

interface Class {
  id: string;
  name: string;
  grade: string;
  subject: string;
  totalStudents: number;
}

interface ClassListProps {
  classes: Class[];
  selectedClass: string | null;
  onSelectClass: (classId: string) => void;
}

export default function ClassList({
  classes,
  selectedClass,
  onSelectClass,
}: ClassListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClasses = classes.filter(
    (class_) =>
      class_.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      class_.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      class_.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <TextField
        fullWidth
        size="small"
        placeholder="Search classes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconSearch size={20} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {filteredClasses.length === 0 ? (
        <Typography color="textSecondary" align="center">
          No classes found
        </Typography>
      ) : (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {filteredClasses.map((class_) => (
            <ListItemButton
              key={class_.id}
              selected={class_.id === selectedClass}
              onClick={() => onSelectClass(class_.id)}
              sx={{
                borderRadius: 1,
                mb: 1,
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                },
              }}
            >
              <ListItemText
                primary={class_.name}
                secondary={`${class_.subject} - Grade ${class_.grade}`}
                primaryTypographyProps={{
                  variant: 'subtitle1',
                  fontWeight: class_.id === selectedClass ? 600 : 400,
                }}
              />
              <ListItemSecondaryAction>
                <Chip
                  label={`${class_.totalStudents} students`}
                  size="small"
                  color={class_.id === selectedClass ? 'primary' : 'default'}
                />
              </ListItemSecondaryAction>
            </ListItemButton>
          ))}
        </List>
      )}
    </Box>
  );
}
