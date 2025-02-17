'use client';
import {
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    IconButton,
    Tooltip,
    Chip,
    Stack,
    Typography,
    Box,
    LinearProgress,
} from '@mui/material';
import {
    IconMessageCircle,
    IconShare,
    IconEye,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';

interface Announcement {
    id: string;
    title: string;
    content: string;
    author: {
        name: string;
        avatar: string;
    };
    type: 'general' | 'academic' | 'event' | 'urgent';
    createdAt: string;
    views: number;
}

export default function AnnouncementList() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:3000/api/staff/announcements', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch announcements');
                }

                const data = await response.json();
                setAnnouncements(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load announcements');
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    const getAnnouncementColor = (type: string) => {
        switch (type) {
            case 'urgent':
                return 'error';
            case 'academic':
                return 'primary';
            case 'event':
                return 'success';
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

    if (announcements.length === 0) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="textSecondary">No announcements</Typography>
            </Box>
        );
    }

    return (
        <List>
            {announcements.map((announcement) => (
                <ListItem
                    key={announcement.id}
                    sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        '&:last-child': { mb: 0 },
                    }}
                    secondaryAction={
                        <Stack direction="row" spacing={1}>
                            <Tooltip title="View Details">
                                <IconButton>
                                    <IconEye size={20} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Share">
                                <IconButton>
                                    <IconShare size={20} />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    }
                >
                    <ListItemAvatar>
                        <Avatar src={announcement.author.avatar} alt={announcement.author.name} />
                    </ListItemAvatar>
                    <ListItemText
                        primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="subtitle1">
                                    {announcement.title}
                                </Typography>
                                <Chip
                                    label={announcement.type}
                                    size="small"
                                    color={getAnnouncementColor(announcement.type) as any}
                                />
                            </Stack>
                        }
                        secondary={
                            <Stack direction="row" spacing={2} alignItems="center" mt={0.5}>
                                <Typography variant="caption" color="textSecondary">
                                    By {announcement.author.name}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {new Date(announcement.createdAt).toLocaleDateString()}
                                </Typography>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <IconEye size={16} />
                                    <Typography variant="caption">
                                        {announcement.views}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <IconMessageCircle size={16} />
                                    <Typography variant="caption">
                                        {/* TODO: Add comments count */}
                                        0
                                    </Typography>
                                </Stack>
                            </Stack>
                        }
                    />
                </ListItem>
            ))}
        </List>
    );
}
