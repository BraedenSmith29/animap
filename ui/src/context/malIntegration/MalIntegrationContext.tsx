import { createContext } from 'react';
import type { ListItem } from '@/types/list.ts';

interface MalIntegrationContextType {
    isAuthenticated: () => boolean;
    fetchTokenFromCode: (code: string, state: string) => Promise<void>;
    login: () => void;
    logout: () => void;
    animangaList: ListItem[];
}

export const MalIntegrationContext = createContext<MalIntegrationContextType | undefined>(undefined);
