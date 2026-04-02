import { useCallback, useEffect, useState } from 'react';
import type { Graph } from '../types/graph.ts';
import { useJikanClient } from './useJikanClient.ts';

export function useJikanGraph(sourceId: string | undefined) {
    const jikanClient = useJikanClient();
    const [graph, setGraph] = useState<Graph>({ nodes: [], edges: [] });
    const [loading, setLoading] = useState(false);

    const fetchJikanGraph = useCallback(async (sourceId: string, signal: AbortSignal) => {
        let newGraph: Graph = { nodes: [], edges: [] };
        let queue: { type: 'anime' | 'manga', id: string }[] = [{ type: 'anime', id: sourceId }];
        let alreadyQueued: Set<string> = new Set();
        alreadyQueued.add('anime' + sourceId);
        while (queue.length > 0) {
            if (signal.aborted) return;
            const nextItem = queue.shift();
            if (!nextItem) continue;
            const { type, id: currentId } = nextItem;

            const item = await jikanClient.getDetails(type, currentId, signal);
            if (!item) continue;

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
        return newGraph;
    }, []);

    useEffect(() => {
        if (!sourceId) {
            return;
        }

        setLoading(true);
        setGraph({ nodes: [], edges: [] });

        const controller = new AbortController();
        fetchJikanGraph(sourceId, controller.signal)
            .then((graph) => {
                if (graph) {
                    setGraph(graph)
                }
            })
            .catch((error) => {
                if (error instanceof Error && error.name === 'AbortError') {
                    return;
                }
                console.error('Failed to fetch graph:', error);
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => {
            controller.abort();
        };
    }, [sourceId, fetchJikanGraph]);

    return { graph, loading };
}
