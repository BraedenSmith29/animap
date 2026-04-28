import { createContext } from 'react';
import type { ListItem } from '@/types/list.ts';
import type { MediaType } from '@/types';

interface MalIntegrationContextType {
    isAuthenticated: () => boolean;
    fetchTokenFromCode: (code: string, state: string) => Promise<void>;
    login: () => void;
    logout: () => void;
    animangaList: ListItem[];
    addToList: (mediaType: MediaType, id: string) => Promise<boolean>;
}

export const MalIntegrationContext = createContext<MalIntegrationContextType | undefined>(undefined);
