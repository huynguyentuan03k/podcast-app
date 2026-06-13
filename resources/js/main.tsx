import '../css/app.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import AppRouter from './routes/app-router';

const queryClient = new QueryClient();

const root = document.getElementById('root');

if (root !== null) {
    createRoot(root).render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <AppRouter />
                    <Toaster />
                </BrowserRouter>
            </QueryClientProvider>
        </StrictMode>,
    );
}
