'use client';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Typography,
    CircularProgress,
    Alert,
    TablePagination,
} from '@mui/material';
import { useState } from 'react';

interface Column {
    id: string;
    label: string;
    width?: number;
    align?: 'left' | 'center' | 'right';
    render?: (value: any, row: any) => React.ReactNode;
}

interface CustomTableProps {
    columns: Column[];
    data: any[];
    loading?: boolean;
    error?: string | null;
    actions?: (row: any) => React.ReactNode;
    pagination?: boolean;
}

export default function CustomTable({
    columns,
    data,
    loading = false,
    error = null,
    actions,
    pagination = true,
}: CustomTableProps) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (loading) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!data.length) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="textSecondary">
                    No data available
                </Typography>
            </Box>
        );
    }

    const displayData = pagination
        ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        : data;

    return (
        <>
            <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align || 'left'}
                                    style={{ 
                                        width: column.width,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        {column.label}
                                    </Typography>
                                </TableCell>
                            ))}
                            {actions && (
                                <TableCell
                                    align="center"
                                    style={{ width: 100 }}
                                >
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        Actions
                                    </Typography>
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayData.map((row, index) => (
                            <TableRow
                                key={row.id || index}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align || 'left'}
                                    >
                                        {column.render
                                            ? column.render(row[column.id], row)
                                            : row[column.id]}
                                    </TableCell>
                                ))}
                                {actions && (
                                    <TableCell align="center">
                                        {actions(row)}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {pagination && (
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            )}
        </>
    );
}
