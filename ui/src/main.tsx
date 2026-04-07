import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Graph } from './pages/Graph.tsx';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Home } from './pages/Home.tsx';
import { JikanClientProvider } from './contexts/JikanClientContext.tsx';

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
