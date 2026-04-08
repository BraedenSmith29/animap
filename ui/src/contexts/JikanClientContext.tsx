import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useRef } from 'react';
import type { Anime, Manga } from '@tutkli/jikan-ts/types';
import { cacheGet, cacheSet, clearExpired } from '@/utils/jikanCache.ts';
import type { MediaType } from '@/types';

interface QueueItem {
    resolve: (value?: any) => void;
    signal: AbortSignal;
}

interface JikanClientContextType {
    getDetails: (type: MediaType, currentId: string, signal: AbortSignal) => Promise<Anime | Manga | null>;
    search: (type: MediaType, query: string, signal: AbortSignal) => Promise<Anime[] | Manga[] | null>;
}

const JikanClientContext = createContext<JikanClientContextType | null>(null);

export function JikanClientProvider({ children }: { children: ReactNode }) {
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
        async (type: MediaType, currentId: string, signal: AbortSignal) => {
            const key = `animap:${type}:${currentId}`;
            const cachedData = await cacheGet(key);
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
                    });
                    return body.data;
                }
            }
        },
        [addToQueue],
    );

    const search = useCallback(
        async (type: MediaType, query: string, signal: AbortSignal) => {
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
        },
        [addToQueue],
    );

    return (
        <JikanClientContext.Provider value={{ getDetails, search }}>
            {children}
        </JikanClientContext.Provider>
    );
}

export function useJikanClientContext() {
    const context = useContext(JikanClientContext);
    if (!context) {
        throw new Error('useJikanClientContext must be used within a JikanClientProvider');
    }
    return context;
}
