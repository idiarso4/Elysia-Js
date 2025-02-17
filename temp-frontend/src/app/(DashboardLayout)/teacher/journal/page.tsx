'use client';
import {
    Grid,
    Box,
    Card,
    Typography,
    Stack,
    Button,
    IconButton,
    Tooltip,
    TextField,
    InputAdornment,
} from '@mui/material';
import { useState, useEffect } from 'react';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { IconPlus, IconSearch, IconFilter } from '@tabler/icons-react';
import JournalList from './components/JournalList';
import JournalEditor from './components/JournalEditor';
import JournalFilters from './components/JournalFilters';

interface JournalFiltersState {
    class: string;
    date: string;
    type: string;
}

export default function JournalPage() {
    const [isEditorOpen, setEditorOpen] = useState(false);
    const [isFiltersOpen, setFiltersOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<JournalFiltersState>({
        class: '',
        date: '',
        type: '',
    });

    const handleSearch = (value: string) => {
        setSearchQuery(value);
    };

    const handleFiltersChange = (newFilters: JournalFiltersState) => {
        setFilters(newFilters);
        setFiltersOpen(false);
    };

    return (
        <PageContainer>
            <Box>
                <Grid container spacing={3}>
                    {/* Header */}
                    <Grid item xs={12}>
                        <Card sx={{ p: 3 }}>
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                justifyContent="space-between"
                                alignItems={{ xs: 'stretch', sm: 'center' }}
                                spacing={2}
                            >
                                <Typography variant="h5">Teaching Journal</Typography>
                                <Stack
                                    direction="row"
                                    spacing={2}
                                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                                >
                                    <TextField
                                        placeholder="Search journals..."
                                        size="small"
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        sx={{ width: { xs: '100%', sm: 300 } }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconSearch size={20} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Tooltip title="Filter Journals">
                                        <IconButton
                                            color={isFiltersOpen ? 'primary' : 'default'}
                                            onClick={() => setFiltersOpen(!isFiltersOpen)}
                                        >
                                            <IconFilter />
                                        </IconButton>
                                    </Tooltip>
                                    <Button
                                        variant="contained"
                                        startIcon={<IconPlus />}
                                        onClick={() => setEditorOpen(true)}
                                    >
                                        New Entry
                                    </Button>
                                </Stack>
                            </Stack>

                            {/* Filters Panel */}
                            {isFiltersOpen && (
                                <Box sx={{ mt: 3 }}>
                                    <JournalFilters
                                        filters={filters}
                                        onApply={handleFiltersChange}
                                        onClose={() => setFiltersOpen(false)}
                                    />
                                </Box>
                            )}
                        </Card>
                    </Grid>

                    {/* Journal List */}
                    <Grid item xs={12}>
                        <JournalList
                            searchQuery={searchQuery}
                            filters={filters}
                            onEdit={(journalId) => {
                                // TODO: Load journal entry and open editor
                                setEditorOpen(true);
                            }}
                        />
                    </Grid>
                </Grid>
            </Box>

            {/* Journal Editor Dialog */}
            <JournalEditor
                open={isEditorOpen}
                onClose={() => setEditorOpen(false)}
                onSave={async (data) => {
                    // TODO: Save journal entry
                    setEditorOpen(false);
                }}
            />
        </PageContainer>
    );
}
