import type { MediaType } from '@/types';

export interface SearchResult {
    id: number;
    title: string | null;
    enTitle: string | null;
    jaTitle: string | null;
    portraitImage: string | null;
    type: MediaType;
}