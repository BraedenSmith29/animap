import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Graph, Home } from '@/pages';
import { BrowserRouter, Route, Routes } from 'react-router';
import { SearchFilterProvider } from '@/context/searchFilter';

createRoot(document.getElementById('app')!).render(
    <StrictMode>
        <SearchFilterProvider>
            <BrowserRouter>
                <Routes>
                    <Route index element={<Home />} />
                    <Route path=":type/:id" element={<Graph />} />
                </Routes>
            </BrowserRouter>
        </SearchFilterProvider>
    </StrictMode>,
);
