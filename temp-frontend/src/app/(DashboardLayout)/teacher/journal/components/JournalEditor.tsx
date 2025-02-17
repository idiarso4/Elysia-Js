'use client';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    IconButton,
    Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
    IconUpload,
    IconX,
    IconFile,
    IconTrash,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';

interface Class {
    id: string;
    name: string;
    grade: string;
}

interface JournalData {
    title: string;
    content: string;
    classId: string;
    type: 'lesson' | 'activity' | 'assessment' | 'observation';
    date: Date;
    attachments: File[];
}

interface JournalEditorProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: JournalData) => Promise<void>;
    initialData?: Partial<JournalData>;
}

export default function JournalEditor({
    open,
    onClose,
    onSave,
    initialData,
}: JournalEditorProps) {
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<JournalData>({
        title: '',
        content: '',
        classId: '',
        type: 'lesson',
        date: new Date(),
        attachments: [],
        ...initialData,
    });

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
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load classes');
            }
        };

        if (open) {
            fetchClasses();
        }
    }, [open]);

    const handleAttachmentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            setFormData(prev => ({
                ...prev,
                attachments: [...prev.attachments, ...Array.from(files)],
            }));
        }
    };

    const handleRemoveAttachment = (index: number) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.content || !formData.classId) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            await onSave(formData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save journal');
        } finally {
            setLoading(false);
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
                {initialData ? 'Edit Journal Entry' : 'New Journal Entry'}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 2 }}>
                    <TextField
                        label="Title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        fullWidth
                        required
                    />

                    <Stack direction="row" spacing={2}>
                        <FormControl fullWidth required>
                            <InputLabel>Class</InputLabel>
                            <Select
                                value={formData.classId}
                                label="Class"
                                onChange={(e) => setFormData(prev => ({ ...prev, classId: e.target.value }))}
                            >
                                {classes.map((class_) => (
                                    <MenuItem key={class_.id} value={class_.id}>
                                        {class_.name} - Grade {class_.grade}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth required>
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={formData.type}
                                label="Type"
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    type: e.target.value as JournalData['type']
                                }))}
                            >
                                <MenuItem value="lesson">Lesson</MenuItem>
                                <MenuItem value="activity">Activity</MenuItem>
                                <MenuItem value="assessment">Assessment</MenuItem>
                                <MenuItem value="observation">Observation</MenuItem>
                            </Select>
                        </FormControl>

                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Date"
                                value={formData.date}
                                onChange={(newValue) => newValue && setFormData(prev => ({
                                    ...prev,
                                    date: newValue
                                }))}
                            />
                        </LocalizationProvider>
                    </Stack>

                    <TextField
                        label="Content"
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        multiline
                        rows={6}
                        fullWidth
                        required
                    />

                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            Attachments
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {formData.attachments.map((file, index) => (
                                <Chip
                                    key={index}
                                    icon={<IconFile size={16} />}
                                    label={file.name}
                                    onDelete={() => handleRemoveAttachment(index)}
                                    sx={{ mb: 1 }}
                                />
                            ))}
                        </Stack>
                        <Button
                            component="label"
                            startIcon={<IconUpload />}
                            sx={{ mt: 1 }}
                        >
                            Upload Files
                            <input
                                type="file"
                                multiple
                                hidden
                                onChange={handleAttachmentUpload}
                            />
                        </Button>
                    </Box>

                    {error && (
                        <Typography color="error">
                            {error}
                        </Typography>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={onClose}
                    startIcon={<IconX />}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
