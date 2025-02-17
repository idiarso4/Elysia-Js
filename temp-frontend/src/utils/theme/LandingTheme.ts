import { createTheme } from '@mui/material/styles';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const landingTheme = createTheme({
    palette: {
        primary: {
            main: '#2196F3',
            light: '#64B5F6',
            dark: '#1976D2',
        },
        secondary: {
            main: '#FF4081',
            light: '#FF80AB',
            dark: '#F50057',
        },
        background: {
            default: '#FFFFFF',
            paper: '#FFFFFF',
        },
    },
    typography: {
        fontFamily: inter.style.fontFamily,
        h1: {
            fontSize: '3.5rem',
            fontWeight: 700,
            lineHeight: 1.2,
        },
        h2: {
            fontSize: '3rem',
            fontWeight: 700,
            lineHeight: 1.2,
        },
        h3: {
            fontSize: '2.25rem',
            fontWeight: 600,
            lineHeight: 1.3,
        },
        h4: {
            fontSize: '1.75rem',
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h5: {
            fontSize: '1.5rem',
            fontWeight: 500,
            lineHeight: 1.4,
        },
        h6: {
            fontSize: '1.25rem',
            fontWeight: 500,
            lineHeight: 1.4,
        },
        subtitle1: {
            fontSize: '1.125rem',
            fontWeight: 500,
            lineHeight: 1.5,
        },
        subtitle2: {
            fontSize: '1rem',
            fontWeight: 500,
            lineHeight: 1.57,
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.57,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.57,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    padding: '8px 24px',
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
                },
            },
        },
    },
});
