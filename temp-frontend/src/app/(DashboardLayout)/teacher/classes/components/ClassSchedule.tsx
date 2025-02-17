'use client';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    Stack,
    Chip,
    IconButton,
    Tooltip,
} from '@mui/material';
import { IconEdit, IconMapPin } from '@tabler/icons-react';
import { useState, useEffect } from 'react';

interface ScheduleItem {
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    room: string;
    building: string;
}

interface ClassScheduleProps {
    classId: string;
    onError: (message: string) => void;
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function ClassSchedule({ classId, onError }: ClassScheduleProps) {
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(
                    `http://localhost:3000/api/teacher/classes/${classId}/schedule`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch schedule');
                }

                const data = await response.json();
                setSchedule(data);
            } catch (err) {
                onError(err instanceof Error ? err.message : 'Failed to load schedule');
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [classId, onError]);

    if (loading) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Loading schedule...</Typography>
            </Box>
        );
    }

    return (
        <Grid container spacing={3}>
            {days.map((day) => {
                const daySchedule = schedule.filter((item) => item.day === day);
                return (
                    <Grid item xs={12} key={day}>
                        <Card variant="outlined">
                            <CardContent>
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    mb={2}
                                >
                                    <Typography variant="h6">{day}</Typography>
                                    {daySchedule.length === 0 && (
                                        <Chip
                                            label="No Classes"
                                            color="default"
                                            size="small"
                                        />
                                    )}
                                </Stack>
                                <Stack spacing={2}>
                                    {daySchedule.map((item) => (
                                        <Paper
                                            key={item.id}
                                            sx={{
                                                p: 2,
                                                bgcolor: 'background.default',
                                                position: 'relative',
                                            }}
                                        >
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item xs={3}>
                                                    <Typography variant="subtitle1">
                                                        {item.startTime} - {item.endTime}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <IconMapPin size={20} />
                                                        <Typography>
                                                            Room {item.room}, {item.building}
                                                        </Typography>
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <Stack
                                                        direction="row"
                                                        spacing={1}
                                                        justifyContent="flex-end"
                                                    >
                                                        <Tooltip title="Edit Schedule">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {/* TODO: Implement edit */}}
                                                            >
                                                                <IconEdit size={20} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );
}
