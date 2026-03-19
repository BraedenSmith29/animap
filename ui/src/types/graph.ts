export interface Anime {
    id: string;
    label: string;
    title: string;
    en_title?: string;
    jp_title?: string;
    main_picture: {
        medium?: string;
        large?: string;
    };
    startDate?: string;
    endDate?: string;
    synopsis?: string;
    meanScore?: number;
    numListUsers?: number;
    nsfw?: 'white' | 'gray' | 'black';
    mediaType?: 'unknown' | 'tv' | 'movie' | 'ova' | 'ona' | 'special' | 'music';
    status?: 'finished_airing' | 'currently_airing' | 'not_yet_aired';
    numEpisodes?: number;
    source?: 'other' | 'original' | 'manga' | '4_koma_manga' | 'web_manga' | 'digital_manga' | 'novel' | 'light_novel' | 'visual_novel' | 'game' | 'card_game' | 'book' | 'picture_book' | 'radio' | 'music';
    rating?: 'g' | 'pg' | 'pg_13' | 'r' | 'r+' | 'rx';
}

export interface Edge {
    source: string;
    target: string;
    id: string;
    label: string;
}

export interface GraphResponse {
    anime: Anime[];
    edges: Edge[];
}
