import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Graph, Home } from '@/pages';
import { BrowserRouter, Route, Routes } from 'react-router';

createRoot(document.getElementById('app')!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route index element={<Home />} />
                <Route path=":type/:id" element={<Graph />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>,
);
