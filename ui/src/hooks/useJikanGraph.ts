import { useCallback, useEffect, useState } from 'react';
import type { Graph, MediaType, Node } from '../types/graph.ts';
import type { Anime, Manga } from '@tutkli/jikan-ts/types';
import { useJikanClientContext } from '../contexts/JikanClientContext.tsx';
import { createAnimeNode, createMangaNode } from '../utils/jikanProcessing.ts';
import { loadTexture } from '../utils/textureCache.ts';

export function useJikanGraph(sourceType: string | undefined, sourceId: string | undefined) {
    const jikanClient = useJikanClientContext();
    const [graph, setGraph] = useState<Graph>({ nodes: [], edges: [] });
    const [loading, setLoading] = useState(false);

    const fetchJikanGraph = useCallback(async (sourceType: MediaType, sourceId: string, signal: AbortSignal) => {
        let newGraph: Graph = { nodes: [], edges: [] };
        let queue: { type: MediaType, id: string }[] = [{ type: sourceType, id: sourceId }];
        let alreadyQueued: Set<string> = new Set();
        alreadyQueued.add(sourceType + sourceId);
        while (queue.length > 0) {
            if (signal.aborted) return;
            const nextItem = queue.shift();
            if (!nextItem) continue;
            const { type, id: currentId } = nextItem;

            const item = await jikanClient.getDetails(type, currentId, signal);
            if (!item) continue;

            let newNode: Node;
            if (type === 'anime') {
                newNode = createAnimeNode(item as Anime);
            } else if (type === 'manga') {
                newNode = createMangaNode(item as Manga);
            } else {
                continue;
            }
            newGraph.nodes.push(newNode);

            const nodeImage = newNode.nodeType === 'anime' ? newNode.anime.nodeImage : newNode.manga.nodeImage;
            if (nodeImage) {
                void loadTexture(item.mal_id.toString(), nodeImage);
            }

            if (item.relations) {
                for (const relation of item.relations) {
                    const relationType = relation.relation;
                    for (const entry of relation.entry) {
                        if (entry.type !== 'anime' && entry.type !== 'manga') continue;
                        const sourceId = type + currentId;
                        const targetId = entry.type + entry.mal_id;
                        const edgeId = `${sourceId}-${targetId}`;
                        if (newGraph.edges.find((e) => e.id === edgeId)) continue;
                        newGraph.edges.push({
                            source: sourceId,
                            target: targetId,
                            label: relationType,
                            id: edgeId,
                        });
                        if (!alreadyQueued.has(targetId)) {
                            alreadyQueued.add(targetId);
                            queue.push({ type: entry.type, id: entry.mal_id.toString() });
                        }
                    }
                }
            }
        }
        if (signal.aborted) return;
        return newGraph;
    }, []);

    useEffect(() => {
        if (!sourceId || sourceType !== 'anime' && sourceType !== 'manga') {
            return;
        }

        setLoading(true);
        setGraph({ nodes: [], edges: [] });

        const controller = new AbortController();
        fetchJikanGraph(sourceType, sourceId, controller.signal)
            .then((graph) => {
                if (graph) {
                    setGraph(graph);
                }
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
