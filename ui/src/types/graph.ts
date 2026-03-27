export interface Anime {
    malId: string;
    title: string;
    enTitle?: string;
    jaTitle?: string;
    mainPicture?: string;
    startDate?: string;
    endDate?: string;
    synopsis?: string;
    meanScore?: number;
    numListUsers: number;
    nsfw?: 'white' | 'gray' | 'black';
    mediaType: 'unknown' | 'tv' | 'movie' | 'ova' | 'ona' | 'special' | 'music';
    status: 'finished_airing' | 'currently_airing' | 'not_yet_aired';
    numEpisodes: number;
    source?: 'other' | 'original' | 'manga' | '4_koma_manga' | 'web_manga' | 'digital_manga' | 'novel' | 'light_novel' | 'visual_novel' | 'game' | 'card_game' | 'book' | 'picture_book' | 'radio' | 'music';
    averageEpisodeDuration?: number;
    rating?: 'g' | 'pg' | 'pg_13' | 'r' | 'r+' | 'rx';
}

export interface Manga {
    malId: string;
    title: string;
    enTitle?: string;
    jaTitle?: string;
    mainPicture?: string;
    startDate?: string;
    endDate?: string;
    synopsis?: string;
    meanScore?: number;
    numListUsers: number;
    nsfw?: 'white' | 'gray' | 'black';
    mediaType: 'unknown' | 'manga' | 'novel' | 'one_shot' | 'doujinshi' | 'manhwa' | 'manhua' | 'oel';
    status: 'finished_airing' | 'currently_publishing' | 'not_yet_published';
    numVolumes: number;
    numChapters: number;
    authors: {
        firstName: string;
        lastName: string;
        role: string;
    }[]
}

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

export type Node = AnimeNode | MangaNode;

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
