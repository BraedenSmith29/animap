import type { AnimeRatingString, AnimeStatus, AnimeType, MangaStatus, MangaType } from '@tutkli/jikan-ts';

export interface Anime {
    malId: string;
    title: string | null;
    enTitle: string | null;
    jaTitle: string | null;
    portraitImage: string | null;
    nodeImage: string | null;
    startDate: string | null;
    endDate: string | null;
    synopsis: string | null;
    score: number | null;
    members: number | null;
    nsfw: boolean;
    mediaType: AnimeType | null;
    status: AnimeStatus | null;
    episodes: number | null;
    source: string | null;
    duration: number | null;
    rating: AnimeRatingString | null;
}

export interface Manga {
    malId: string;
    title: string | null;
    enTitle: string | null;
    jaTitle: string | null;
    portraitImage: string | null;
    nodeImage: string | null;
    startDate: string | null;
    endDate: string | null;
    synopsis: string | null;
    score: number | null;
    members: number | null;
    nsfw: boolean;
    mediaType: MangaType | null;
    status: MangaStatus | null;
    volumes: number | null;
    chapters: number | null;
}

export type MediaType = 'anime' | 'manga'

export interface BaseNode {
    id: string;
    label: string;
}

export interface AnimeNode extends BaseNode {
    nodeType: 'anime';
    anime: Anime;
}

export interface MangaNode extends BaseNode {
    nodeType: 'manga';
    manga: Manga;
}

export interface EmptyNode extends BaseNode {
    nodeType: null;
    mediaType: MediaType;
    malId: string;
}

export type Node = AnimeNode | MangaNode | EmptyNode;
export type FullNode = AnimeNode | MangaNode;

export interface Edge {
    source: string;
    target: string;
    id: string;
    label: string;
}

export interface Graph {
    nodes: Node[];
    edges: Edge[];
}
