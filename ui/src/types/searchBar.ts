import type { MediaType } from '@/types';

interface MalItem {
    id: number;
    name: string;
    image_url?: string | null;
    payload?: {
        media_type?: string | null;
        start_year?: number | null;
    }
    // There's more, but this is all I care about
}

export interface MalSearchResponse {
    categories: {
        type: string;
        items: MalItem[]
    }[]
}

export type SearchFilter = 'all' | 'anime' | 'manga';

export type AnimeSearchType = 'TV' | 'OVA' | 'Movie' | 'Special' | 'ONA' | 'Music' | 'CM' | 'PV' | 'TV Special';
export type MangaSearchType = 'Manga' | 'Novel' | 'Light Novel' | 'One-shot' | 'Doujinshi' | 'Manhua' | 'Manhwa';
export type MediaTypeFilter = AnimeSearchType | MangaSearchType;

export interface FullSearchFilter {
    category: SearchFilter;
    excludedMediaTypes: MediaTypeFilter[];
}

export interface SearchResult {
    id: number;
    title: string | null;
    portraitImage: string | null;
    format: string | null;
    year: number | null;
    type: MediaType;
}
