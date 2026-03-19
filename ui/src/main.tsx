import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Route, Routes } from "react-router";
import { Home } from "./pages/Home.tsx";

createRoot(document.getElementById('app')!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route index element={<Home />} />
                <Route path=":animeId" element={<App />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>,
)
