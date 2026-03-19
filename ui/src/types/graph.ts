export interface Anime {
    id: string;
    label: string;
    title: string;
    en_title: string;
    jp_title: string;
    main_picture: {
        medium: string;
        large: string;
    };
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
