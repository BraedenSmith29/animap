import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Graph } from './pages/Graph.tsx';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Home } from './pages/Home.tsx';

createRoot(document.getElementById('app')!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route index element={<Home />} />
                <Route path=":animeId" element={<Graph />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>,
);
