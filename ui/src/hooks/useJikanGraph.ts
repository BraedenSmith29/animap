import { useCallback, useEffect, useRef, useState } from 'react';
import type { Graph } from '../types/graph.ts';

export function useJikanGraph(sourceId: string | undefined) {
    const [graph, setGraph] = useState<Graph>({ nodes: [], edges: [] });
    const [loading, setLoading] = useState(false);
    const lastFetchedId = useRef<string | null>(null);

    const fetchJikanGraph = useCallback(async (sourceId: string, signal: AbortSignal) => {
        setLoading(true);
        setGraph({ nodes: [], edges: [] });
        let newGraph: Graph = { nodes: [], edges: [] };
        let queue: { type: 'anime' | 'manga', id: string }[] = [{ type: 'anime', id: sourceId }];
        let alreadyQueued: Set<string> = new Set();
        alreadyQueued.add('anime' + sourceId);
        let lastReqTime = 0;

        try {
            while (queue.length > 0) {
                if (signal.aborted) return;
                const nextItem = queue.shift();
                if (!nextItem) continue;
                const { type, id: currentId } = nextItem;

                if (Date.now() - lastReqTime < 1000) {
                    await new Promise(resolve => {
                        const timeout = setTimeout(resolve, 1000 - (Date.now() - lastReqTime));
                        signal.addEventListener('abort', () => {
                            clearTimeout(timeout);
                            resolve(null);
                        }, { once: true });
                    });
                }
                if (signal.aborted) return;
                lastReqTime = Date.now();
                const response = await fetch(`https://api.jikan.moe/v4/${type}/${currentId}/full`, {
                    method: 'GET',
                });
                if (!response.ok) {
                    continue;
                }
                const body = await response.json();
                const item = body.data;
                if (!item) continue;
                if (signal.aborted) return;

                if (type === 'anime') {
                    newGraph.nodes.push({
                        id: 'anime' + currentId,
                        label: item.title,
                        nodeType: 'anime',
                        anime: {
                            malId: item.mal_id,
                            title: item.title,
                            mainPicture: item.images.webp.large_image_url,
                            numListUsers: item.members,
                            mediaType: item.type,
                            status: item.status,
                            numEpisodes: item.episodes,
                        },
                    });
                } else if (type === 'manga') {
                    newGraph.nodes.push({
                        id: 'manga' + currentId,
                        label: item.title,
                        nodeType: 'manga',
                        manga: {
                            malId: item.mal_id,
                            title: item.title,
                            numListUsers: item.members,
                            mediaType: item.type,
                            status: item.status,
                            numVolumes: item.volumes,
                            numChapters: item.chapters,
                            authors: [],
                        },
                    });
                } else {
                    continue;
                }

                for (const relation of item.relations) {
                    const relationType = relation.relation;
                    for (const entry of relation.entry) {
                        newGraph.edges.push({
                            source: type + currentId,
                            target: entry.type + entry.mal_id,
                            label: relationType,
                            id: `${type}${currentId}-${entry.type}${entry.mal_id}`,
                        });
                        if (!alreadyQueued.has(entry.type + entry.mal_id) && entry.type === 'anime') {
                            alreadyQueued.add(entry.type + entry.mal_id);
                            queue.push({ type: entry.type, id: entry.mal_id });
                        }
                    }
                }
            }
            if (signal.aborted) return;
            setGraph(newGraph);
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return;
            }
            console.error('Failed to fetch graph:', error);
        } finally {
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        if (!sourceId || lastFetchedId.current === sourceId) {
            return;
        }

        const controller = new AbortController();
        lastFetchedId.current = sourceId;
        fetchJikanGraph(sourceId, controller.signal);

        return () => {
            controller.abort();
            lastFetchedId.current = null;
        };
    }, [sourceId, fetchJikanGraph]);

    return { graph, loading };
}
