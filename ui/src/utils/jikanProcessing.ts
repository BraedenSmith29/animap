import type { Anime, JikanImages, JikanResourceTitle, Manga } from '@tutkli/jikan-ts/types';

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

export function getNodeImage(images: JikanImages): string | null {
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

export function isNsfw(item: Anime | Manga): boolean {
    return item.genres.find(g => NSFW_GENRES.includes(g.mal_id)) !== undefined;
}

export function getDurationMinutes(duration: string | null): number | null {
    if (!duration || duration === 'Unknown') return null;
    const hrMatch = duration.match(/(\d+) hr/);
    const minMatch = duration.match(/(\d+) min/);
    if (!hrMatch && !minMatch) return null;
    const hours = hrMatch ? parseInt(hrMatch[1], 10) : 0;
    const minutes = minMatch ? parseInt(minMatch[1], 10) : 0;
    return hours * 60 + minutes;
}