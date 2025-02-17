'use client';
import {
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Tooltip,
    Chip,
    Stack,
    Typography,
    Box,
    LinearProgress,
} from '@mui/material';
import {
    IconCheckbox,
    IconCalendarEvent,
    IconPriority,
    IconDotsVertical,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';

interface Task {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
    status: 'pending' | 'in_progress' | 'completed';
    assignedBy: string;
}

export default function TaskList() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:3000/api/staff/tasks', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch tasks');
                }

                const data = await response.json();
                setTasks(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load tasks');
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'error';
            case 'medium':
                return 'warning';
            case 'low':
                return 'info';
            default:
                return 'default';
        }
    };

    if (loading) {
        return <LinearProgress />;
    }

    if (error) {
        return (
            <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
                <Typography>{error}</Typography>
            </Box>
        );
    }

    if (tasks.length === 0) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="textSecondary">No pending tasks</Typography>
            </Box>
        );
    }

    return (
        <List>
            {tasks.map((task) => (
                <ListItem
                    key={task.id}
                    sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        '&:last-child': { mb: 0 },
                    }}
                    secondaryAction={
                        <IconButton edge="end">
                            <IconDotsVertical size={20} />
                        </IconButton>
                    }
                >
                    <ListItemIcon>
                        <IconCheckbox
                            size={24}
                            className={task.status === 'completed' ? 'text-success' : ''}
                        />
                    </ListItemIcon>
                    <ListItemText
                        primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="subtitle1">
                                    {task.title}
                                </Typography>
                                <Chip
                                    label={task.priority}
                                    size="small"
                                    color={getPriorityColor(task.priority) as any}
                                />
                            </Stack>
                        }
                        secondary={
                            <Stack direction="row" spacing={2} alignItems="center" mt={0.5}>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <IconCalendarEvent size={16} />
                                    <Typography variant="caption">
                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </Typography>
                                </Stack>
                                <Typography variant="caption" color="textSecondary">
                                    By: {task.assignedBy}
                                </Typography>
                            </Stack>
                        }
                    />
                </ListItem>
            ))}
        </List>
    );
}
