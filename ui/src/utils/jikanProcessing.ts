import type { Anime, JikanImages, JikanResourceTitle, Manga } from '@tutkli/jikan-ts/types';
import type { Node } from '@/types';

const NSFW_GENRES = [9, 12, 49];

export function getPortraitImage(images: JikanImages): string | null {
    return images.webp?.maximum_image_url
        ?? images.jpg?.maximum_image_url
        ?? images.webp?.large_image_url
        ?? images.jpg?.large_image_url
        ?? images.webp?.medium_image_url
        ?? images.jpg?.medium_image_url
        ?? images.webp?.image_url
        ?? images.jpg?.image_url
        ?? images.webp?.small_image_url
        ?? images.jpg?.small_image_url;
}

function getNodeImage(images: JikanImages): string | null {
    return images.webp?.medium_image_url
        ?? images.jpg?.medium_image_url
        ?? images.webp?.large_image_url
        ?? images.jpg?.large_image_url
        ?? images.webp?.maximum_image_url
        ?? images.jpg?.maximum_image_url
        ?? images.webp?.image_url
        ?? images.jpg?.image_url
        ?? images.webp?.small_image_url
        ?? images.jpg?.small_image_url;
}

export function getTitle(titles: JikanResourceTitle[]): string | null {
    return titles.find(t => t.type === 'Default')?.title ?? null;
}

export function getEnglishTitle(titles: JikanResourceTitle[]): string | null {
    return titles.find(t => t.type === 'English')?.title ?? null;
}

export function getJapaneseTitle(titles: JikanResourceTitle[]): string | null {
    return titles.find(t => t.type === 'Japanese')?.title ?? null;
}

function isNsfw(item: Anime | Manga): boolean {
    return item.genres.find(g => NSFW_GENRES.includes(g.mal_id)) !== undefined;
}

function getDurationMinutes(duration: string | null): number | null {
    if (!duration || duration === 'Unknown') return null;
    const hrMatch = duration.match(/(\d+) hr/);
    const minMatch = duration.match(/(\d+) min/);
    if (!hrMatch && !minMatch) return null;
    const hours = hrMatch ? parseInt(hrMatch[1], 10) : 0;
    const minutes = minMatch ? parseInt(minMatch[1], 10) : 0;
    return hours * 60 + minutes;
}

export function createAnimeNode(anime: Anime): Node {
    return {
        id: 'anime' + anime.mal_id,
        label: getTitle(anime.titles) ?? 'Unknown Anime',
        nodeType: 'anime',
        anime: {
            malId: anime.mal_id.toString(),
            title: getTitle(anime.titles),
            enTitle: getEnglishTitle(anime.titles),
            jaTitle: getJapaneseTitle(anime.titles),
            portraitImage: getPortraitImage(anime.images),
            nodeImage: getNodeImage(anime.images),
            startDate: anime.aired.from,
            endDate: anime.aired.to,
            synopsis: anime.synopsis,
            score: anime.score,
            members: anime.members,
            nsfw: isNsfw(anime),
            mediaType: anime.type,
            status: anime.status,
            episodes: anime.episodes,
            source: anime.source,
            duration: getDurationMinutes(anime.duration),
            rating: anime.rating ?? null,
        },
    };
}

export function createMangaNode(manga: Manga): Node {
    return {
        id: 'manga' + manga.mal_id,
        label: getTitle(manga.titles) ?? 'Unknown Manga',
        nodeType: 'manga',
        manga: {
            malId: manga.mal_id.toString(),
            title: getTitle(manga.titles),
            enTitle: getEnglishTitle(manga.titles),
            jaTitle: getJapaneseTitle(manga.titles),
            portraitImage: getPortraitImage(manga.images),
            nodeImage: getNodeImage(manga.images),
            startDate: manga.published.from,
            endDate: manga.published.to,
            synopsis: manga.synopsis,
            score: manga.score,
            members: manga.members,
            nsfw: isNsfw(manga),
            mediaType: manga.type,
            status: manga.status,
            volumes: manga.volumes,
            chapters: manga.chapters,
        },
    };
}
