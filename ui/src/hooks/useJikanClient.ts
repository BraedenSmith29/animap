import { useCallback, useRef } from 'react';
import type { Anime, Manga } from '@tutkli/jikan-ts/types';
import { cacheGet, cacheSet, clearExpired } from '../utils/jikanCache';

interface QueueItem {
    resolve: (value?: any) => void;
    signal: AbortSignal;
}

export function useJikanClient() {
    const processing = useRef(false);
    const queue = useRef<QueueItem[]>([]);

    const startRunner = useCallback(async () => {
        if (processing.current) return;
        processing.current = true;

        await clearExpired();

        let nextRequest = queue.current.shift();
        while (nextRequest) {
            nextRequest.resolve();
            await new Promise(resolve => setTimeout(resolve, 1000));
            do {
                nextRequest = queue.current.shift();
            } while (nextRequest && nextRequest.signal.aborted);
        }

        processing.current = false;
    }, []);

    const addToQueue = useCallback(async (signal: AbortSignal, skipToFront: boolean) => {
        return new Promise<void>((resolve) => {
            if (skipToFront) {
                queue.current.unshift({ resolve, signal });
            } else {
                queue.current.push({ resolve, signal });
            }
            startRunner();
        });
    }, [startRunner]);

    const getDetails = useCallback(
        (type: string, currentId: string, signal: AbortSignal) => {
            return new Promise<Anime | Manga | null>(async (resolve, reject) => {
                const key = `animap:${type}:${currentId}`;
                const cachedData = await cacheGet(key);
                if (cachedData) {
                    if (cachedData.expiration && cachedData.expiration > Date.now()) {
                        resolve(cachedData.data);
                        return;
                    }
                }
                await addToQueue(signal, false);
                while (true) {
                    try {
                        const response = await fetch(
                            `https://api.jikan.moe/v4/${type}/${currentId}/full`,
                            { signal },
                        );

                        if (response.status === 429) {
                            await addToQueue(signal, true);
                            continue;
                        }

                        if (!response.ok) {
                            reject(response.statusText);
                        } else {
                            const body = await response.json();
                            await cacheSet(key, {
                                expiration: Date.now() + 1000 * 60 * 60 * 24 * 7,
                                data: body.data,
                            });
                            resolve(body.data);
                        }
                    } catch (error) {
                        if (error instanceof Error && error.name === 'AbortError') {
                            resolve(null);
                        } else {
                            reject(error);
                        }
                    }
                    return;
                }
            });
        },
        [addToQueue],
    );

    return { getDetails };
}