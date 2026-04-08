import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Graph, Home } from '@/pages';
import { BrowserRouter, Route, Routes } from 'react-router';
import { JikanClientProvider } from '@/contexts';

createRoot(document.getElementById('app')!).render(
    <StrictMode>
        <JikanClientProvider>
            <BrowserRouter>
                <Routes>
                    <Route index element={<Home />} />
                    <Route path=":type/:id" element={<Graph />} />
                </Routes>
            </BrowserRouter>
        </JikanClientProvider>
    </StrictMode>,
);
