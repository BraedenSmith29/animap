import type { Anime, Manga } from '@tutkli/jikan-ts/types';
import { cacheGet, cacheSet, clearExpired } from '@/utils/jikanCache.ts';
import type { MediaType } from '@/types';

interface QueueItem {
    resolve: (value?: any) => void;
    signal: AbortSignal;
}

let processing = false;
const queue: QueueItem[] = [];

async function startRunner()  {
    if (processing) return;
    processing = true;

    await clearExpired().catch(console.error);

    let nextRequest = queue.shift();
    while (nextRequest) {
        nextRequest.resolve();
        await new Promise(resolve => setTimeout(resolve, 1000));
        do {
            nextRequest = queue.shift();
        } while (nextRequest && nextRequest.signal.aborted);
    }

    processing = false;
}

async function addToQueue(signal: AbortSignal, skipToFront: boolean) {
    return new Promise<void>((resolve) => {
        if (skipToFront) {
            queue.unshift({ resolve, signal });
        } else {
            queue.push({ resolve, signal });
        }
        startRunner();
    });
}

export async function getDetailsFromJikan(type: MediaType, currentId: string, signal: AbortSignal) {
    const key = `animap:${type}:${currentId}`;
    const cachedData = await cacheGet(key).catch(() => null);
    if (cachedData) {
        if (cachedData.expiration && cachedData.expiration > Date.now()) {
            return cachedData.data;
        }
    }
    await addToQueue(signal, false);
    while (true) {
        let response;
        try {
            response = await fetch(
                `https://api.jikan.moe/v4/${type}/${currentId}/full`,
                { signal },
            );
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return null;
            } else {
                throw error;
            }
        }

        if (response.status === 429) {
            await addToQueue(signal, true);
            continue;
        }

        if (!response.ok) {
            throw new Error(response.statusText);
        } else {
            const body = await response.json();
            await cacheSet(key, {
                expiration: Date.now() + 1000 * 60 * 60 * 24 * 7,
                data: body.data,
            }).catch(console.error);
            return body.data;
        }
    }
}

export async function searchJikan(type: MediaType, query: string, signal: AbortSignal) {
    await addToQueue(signal, true);
    while (true) {
        let response;
        try {
            response = await fetch(
                `https://api.jikan.moe/v4/${type}?q=${encodeURIComponent(query)}&limit=3`,
                { signal },
            );
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return null;
            } else {
                throw error;
            }
        }

        if (response.status === 429) {
            await addToQueue(signal, true);
            continue;
        }

        if (!response.ok) {
            throw new Error(response.statusText);
        } else {
            const body = await response.json();
            return body.data as Anime[] | Manga[];
        }
    }
}
