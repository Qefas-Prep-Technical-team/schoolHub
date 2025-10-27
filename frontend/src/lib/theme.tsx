import { createTheme } from '@mui/material/styles';

export const getMuiTheme = (mode: 'light' | 'dark') =>
    createTheme({
        palette: {
            mode,
            ...(mode === 'light'
                ? {
                    background: {
                        default: '#ffffff',
                    },
                    text: {
                        primary: '#0f172a',
                    },
                    primary: {
                        main: '#1e40af',
                    },
                }
                : {
                    background: {
                        default: '#0f172a',
                    },
                    text: {
                        primary: '#ffffff',
                    },
                    primary: {
                        main: '#60a5fa',
                    },
                }),
        },
    });
