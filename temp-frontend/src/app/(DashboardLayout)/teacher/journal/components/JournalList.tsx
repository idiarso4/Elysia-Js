'use client';
import {
    Card,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Tooltip,
    Chip,
    Stack,
    Typography,
    Box,
    LinearProgress,
    Divider,
} from '@mui/material';
import {
    IconEdit,
    IconTrash,
    IconBook,
    IconUsers,
    IconCalendarEvent,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';

interface JournalEntry {
    id: string;
    title: string;
    content: string;
    class: {
        name: string;
        grade: string;
    };
    type: 'lesson' | 'activity' | 'assessment' | 'observation';
    date: string;
    attachments: number;
    lastModified: string;
}

interface JournalListProps {
    searchQuery: string;
    filters: {
        class: string;
        date: string;
        type: string;
    };
    onEdit: (journalId: string) => void;
}

export default function JournalList({ searchQuery, filters, onEdit }: JournalListProps) {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchJournals = async () => {
            try {
                const token = localStorage.getItem('token');
                const queryParams = new URLSearchParams({
                    ...(searchQuery && { search: searchQuery }),
                    ...(filters.class && { class: filters.class }),
                    ...(filters.date && { date: filters.date }),
                    ...(filters.type && { type: filters.type }),
                });

                const response = await fetch(
                    `http://localhost:3000/api/teacher/journals?${queryParams}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch journals');
                }

                const data = await response.json();
                setEntries(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load journals');
            } finally {
                setLoading(false);
            }
        };

        fetchJournals();
    }, [searchQuery, filters]);

    const handleDelete = async (journalId: string) => {
        if (!confirm('Are you sure you want to delete this journal entry?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:3000/api/teacher/journals/${journalId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete journal');
            }

            setEntries(entries.filter(entry => entry.id !== journalId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete journal');
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'lesson':
                return 'primary';
            case 'activity':
                return 'success';
            case 'assessment':
                return 'warning';
            case 'observation':
                return 'info';
            default:
                return 'default';
        }
    };

    if (loading) {
        return (
            <Card>
                <LinearProgress />
            </Card>
        );
    }

    if (error) {
        return (
            <Card sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
                <Typography>{error}</Typography>
            </Card>
        );
    }

    if (entries.length === 0) {
        return (
            <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="textSecondary">No journal entries found</Typography>
            </Card>
        );
    }

    return (
        <Card>
            <List>
                {entries.map((entry, index) => (
                    <Box key={entry.id}>
                        {index > 0 && <Divider />}
                        <ListItem
                            sx={{ py: 2 }}
                            secondaryAction={
                                <Stack direction="row" spacing={1}>
                                    <Tooltip title="Edit Entry">
                                        <IconButton
                                            edge="end"
                                            onClick={() => onEdit(entry.id)}
                                        >
                                            <IconEdit />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Entry">
                                        <IconButton
                                            edge="end"
                                            color="error"
                                            onClick={() => handleDelete(entry.id)}
                                        >
                                            <IconTrash />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            }
                        >
                            <ListItemText
                                primary={
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Typography variant="h6">
                                            {entry.title}
                                        </Typography>
                                        <Chip
                                            label={entry.type}
                                            size="small"
                                            color={getTypeColor(entry.type) as any}
                                        />
                                    </Stack>
                                }
                                secondary={
                                    <Box sx={{ mt: 1 }}>
                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            sx={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                mb: 1,
                                            }}
                                        >
                                            {entry.content}
                                        </Typography>
                                        <Stack
                                            direction="row"
                                            spacing={3}
                                            alignItems="center"
                                            flexWrap="wrap"
                                        >
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <IconUsers size={16} />
                                                <Typography variant="caption">
                                                    {entry.class.name} - Grade {entry.class.grade}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <IconCalendarEvent size={16} />
                                                <Typography variant="caption">
                                                    {new Date(entry.date).toLocaleDateString()}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <IconBook size={16} />
                                                <Typography variant="caption">
                                                    {entry.attachments} attachment(s)
                                                </Typography>
                                            </Stack>
                                            <Typography variant="caption" color="textSecondary">
                                                Last modified: {new Date(entry.lastModified).toLocaleString()}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                }
                            />
                        </ListItem>
                    </Box>
                ))}
            </List>
        </Card>
    );
}
