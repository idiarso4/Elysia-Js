'use client';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

interface DeleteDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    loading?: boolean;
    title: string;
    content: string;
}

export default function DeleteDialog({
    open,
    onClose,
    onConfirm,
    loading = false,
    title,
    content,
}: DeleteDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {content}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button 
                    onClick={onClose}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <LoadingButton
                    onClick={onConfirm}
                    loading={loading}
                    color="error"
                    variant="contained"
                >
                    Delete
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
