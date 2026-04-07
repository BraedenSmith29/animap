import type { MediaType } from './graph.ts';

export interface SearchResult {
    id: number;
    title: string | null;
    enTitle: string | null;
    jaTitle: string | null;
    portraitImage: string | null;
    type: MediaType;
}