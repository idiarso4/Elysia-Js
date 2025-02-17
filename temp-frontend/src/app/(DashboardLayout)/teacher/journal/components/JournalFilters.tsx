'use client';
import {
    Box,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Paper,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useState, useEffect } from 'react';

interface Class {
    id: string;
    name: string;
    grade: string;
}

interface JournalFiltersProps {
    filters: {
        class: string;
        date: string;
        type: string;
    };
    onApply: (filters: { class: string; date: string; type: string; }) => void;
    onClose: () => void;
}

export default function JournalFilters({
    filters,
    onApply,
    onClose,
}: JournalFiltersProps) {
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState(filters.class);
    const [selectedDate, setSelectedDate] = useState<Date | null>(
        filters.date ? new Date(filters.date) : null
    );
    const [selectedType, setSelectedType] = useState(filters.type);

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
            } catch (error) {
                console.error('Failed to load classes:', error);
            }
        };

        fetchClasses();
    }, []);

    const handleApply = () => {
        onApply({
            class: selectedClass,
            date: selectedDate ? selectedDate.toISOString() : '',
            type: selectedType,
        });
    };

    const handleReset = () => {
        setSelectedClass('');
        setSelectedDate(null);
        setSelectedType('');
        onApply({
            class: '',
            date: '',
            type: '',
        });
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems="center"
            >
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Class</InputLabel>
                    <Select
                        value={selectedClass}
                        label="Class"
                        onChange={(e) => setSelectedClass(e.target.value)}
                        size="small"
                    >
                        <MenuItem value="">All Classes</MenuItem>
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
                        onChange={setSelectedDate}
                        slotProps={{
                            textField: {
                                size: 'small',
                            },
                        }}
                    />
                </LocalizationProvider>

                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                        value={selectedType}
                        label="Type"
                        onChange={(e) => setSelectedType(e.target.value)}
                        size="small"
                    >
                        <MenuItem value="">All Types</MenuItem>
                        <MenuItem value="lesson">Lesson</MenuItem>
                        <MenuItem value="activity">Activity</MenuItem>
                        <MenuItem value="assessment">Assessment</MenuItem>
                        <MenuItem value="observation">Observation</MenuItem>
                    </Select>
                </FormControl>

                <Box sx={{ ml: 'auto' }}>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            onClick={handleReset}
                        >
                            Reset
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleApply}
                        >
                            Apply Filters
                        </Button>
                    </Stack>
                </Box>
            </Stack>
        </Paper>
    );
}
