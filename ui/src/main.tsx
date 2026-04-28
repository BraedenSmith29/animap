import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Graph, Home, AuthCallback } from '@/pages';
import { BrowserRouter, Route, Routes } from 'react-router';
import { SearchFilterProvider } from '@/context/searchFilter';
import { MalIntegrationProvider } from '@/context/malIntegration';

createRoot(document.getElementById('app')!).render(
    <StrictMode>
        <MalIntegrationProvider>
            <SearchFilterProvider>
                <BrowserRouter>
                    <Routes>
                        <Route index element={<Home />} />
                        <Route path="callback" element={<AuthCallback />} />
                        <Route path=":type/:id" element={<Graph />} />
                    </Routes>
                </BrowserRouter>
            </SearchFilterProvider>
        </MalIntegrationProvider>
    </StrictMode>,
);
