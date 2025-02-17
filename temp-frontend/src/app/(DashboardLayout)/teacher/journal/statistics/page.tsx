'use client';
import {
    Grid,
    Box,
    Card,
    Typography,
    Stack,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { useState, useEffect } from 'react';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { IconDownload } from '@tabler/icons-react';
import ActivityChart from './components/ActivityChart';
import TypeDistribution from './components/TypeDistribution';
import ClassBreakdown from './components/ClassBreakdown';
import TopicCloud from './components/TopicCloud';

interface JournalStats {
    totalEntries: number;
    entriesByType: {
        type: string;
        count: number;
    }[];
    entriesByClass: {
        className: string;
        count: number;
    }[];
    activityTimeline: {
        date: string;
        count: number;
    }[];
    topTopics: {
        topic: string;
        weight: number;
    }[];
}

export default function JournalStatistics() {
    const [timeRange, setTimeRange] = useState('month'); // week, month, year
    const [stats, setStats] = useState<JournalStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(
                    `http://localhost:3000/api/teacher/journals/statistics?timeRange=${timeRange}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch statistics');
                }

                const data = await response.json();
                setStats(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, [timeRange]);

    const handleExport = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:3000/api/teacher/journals/export?timeRange=${timeRange}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to export report');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `journal_report_${timeRange}_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to export report');
        }
    };

    if (loading) {
        return (
            <PageContainer>
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography>Loading statistics...</Typography>
                </Box>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
                    <Typography>{error}</Typography>
                </Box>
            </PageContainer>
        );
    }

    if (!stats) {
        return (
            <PageContainer>
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography>No statistics available</Typography>
                </Box>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Box>
                <Grid container spacing={3}>
                    {/* Header */}
                    <Grid item xs={12}>
                        <Card sx={{ p: 3 }}>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Typography variant="h5">Journal Statistics</Typography>
                                <Stack direction="row" spacing={2}>
                                    <FormControl sx={{ minWidth: 120 }}>
                                        <InputLabel>Time Range</InputLabel>
                                        <Select
                                            value={timeRange}
                                            label="Time Range"
                                            onChange={(e) => setTimeRange(e.target.value)}
                                            size="small"
                                        >
                                            <MenuItem value="week">Last Week</MenuItem>
                                            <MenuItem value="month">Last Month</MenuItem>
                                            <MenuItem value="year">Last Year</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <Button
                                        variant="outlined"
                                        startIcon={<IconDownload />}
                                        onClick={handleExport}
                                    >
                                        Export Report
                                    </Button>
                                </Stack>
                            </Stack>
                        </Card>
                    </Grid>

                    {/* Activity Timeline */}
                    <Grid item xs={12}>
                        <Card sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Activity Timeline
                            </Typography>
                            <Box sx={{ height: 300 }}>
                                <ActivityChart data={stats.activityTimeline} />
                            </Box>
                        </Card>
                    </Grid>

                    {/* Entry Type Distribution */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Entry Type Distribution
                            </Typography>
                            <Box sx={{ height: 300 }}>
                                <TypeDistribution data={stats.entriesByType} />
                            </Box>
                        </Card>
                    </Grid>

                    {/* Class Breakdown */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Class Breakdown
                            </Typography>
                            <Box sx={{ height: 300 }}>
                                <ClassBreakdown data={stats.entriesByClass} />
                            </Box>
                        </Card>
                    </Grid>

                    {/* Topic Cloud */}
                    <Grid item xs={12}>
                        <Card sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Popular Topics
                            </Typography>
                            <Box sx={{ height: 400 }}>
                                <TopicCloud data={stats.topTopics} />
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </PageContainer>
    );
}
