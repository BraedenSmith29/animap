import { useCallback, useEffect, useRef, useState } from 'react';
import type { FullNode, Graph, MediaType, MediaTypeFilter } from '@/types';
import type { Anime, Manga } from '@tutkli/jikan-ts/types';
import { loadTexture } from '@/utils/textureCache.ts';
import { createAnimeNode, createMangaNode } from '@/utils/jikanProcessing.ts';
import { getDetailsFromJikan } from '@/utils/jikanClient.ts';
import { useSearchFilter } from '@/context/searchFilter';

export function useJikanGraph(sourceType: string | undefined, sourceId: string | undefined) {
    const { filter } = useSearchFilter();

    const [graph, setGraph] = useState<Graph>({ nodes: [], edges: [] });
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const abortControllersRef = useRef<Set<AbortController>>(new Set<AbortController>());

    const fetchJikanGraph = useCallback(async (sourceType: MediaType, sourceId: string, signal: AbortSignal, existingNodes: string[] = []) => {
        const newGraph: Graph = { nodes: [], edges: [] };
        const queue: { type: MediaType, id: string }[] = [{ type: sourceType, id: sourceId }];
        const alreadyQueued: Set<string> = new Set([sourceType + sourceId, ...existingNodes]);
        let borderQueue: { type: MediaType, id: string, title: string }[] = [];
        const likelyCrossoverSet: Set<string> = new Set<string>();

        while (queue.length > 0) {
            if (signal.aborted) return;
            const nextItem = queue.shift();
            if (!nextItem) continue;
            const { type, id: currentId } = nextItem;

            const item = await getDetailsFromJikan(type, currentId, signal);
            if (!item || filter.excludedMediaTypes.includes(item.type as MediaTypeFilter)) continue;

            let newNode: FullNode;
            if (type === 'anime') {
                newNode = createAnimeNode(item as Anime);
            } else if (type === 'manga') {
                newNode = createMangaNode(item as Manga);
            } else {
                continue;
            }
            newGraph.nodes.push(newNode);
            setProgress(newGraph.nodes.length);

            const nodeImage = newNode.nodeType === 'anime' ? newNode.anime.nodeImage : newNode.manga.nodeImage;
            if (nodeImage) {
                void loadTexture(newNode.id, nodeImage);
            }

            if (!item.relations) continue;
            for (const relation of item.relations) {
                const relationType = relation.relation;
                for (const entry of relation.entry) {
                    if (entry.type !== 'anime' && entry.type !== 'manga') continue;
                    if (filter.category !== 'all' && filter.category !== entry.type) continue;
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

                    if (alreadyQueued.has(targetId)) continue;

                    if (!likelyCrossoverSet.has(sourceId)) {
                        borderQueue = borderQueue.filter((q) => q.type !== entry.type || q.id !== targetId);
                        alreadyQueued.add(targetId);
                        queue.push({
                            type: entry.type,
                            id: entry.mal_id.toString(),
                        });
                        if (relationType === 'Character' || relationType === 'Other') {
                            likelyCrossoverSet.add(targetId);
                        }
                    } else if (!borderQueue.some((q) => q.type === entry.type && q.id === targetId)) {
                        borderQueue.push({
                            type: entry.type,
                            id: entry.mal_id.toString(),
                            title: entry.name,
                        });
                    }
                }
            }
        }

        for (const item of borderQueue) {
            newGraph.nodes.push({
                id: item.type + item.id,
                label: item.title,
                nodeType: null,
                mediaType: item.type,
                malId: item.id,
            });
        }

        if (signal.aborted) return;
        return newGraph;
    }, [filter]);

    const deleteSubgraph = (nodeId: string) => {
        if (!sourceId || sourceType !== 'anime' && sourceType !== 'manga') return;
        if (nodeId === sourceType + sourceId) return;

        const rootId = sourceType + sourceId;
        const queue = [rootId];
        const reachableNodes = new Set<string>([rootId]);

        while (queue.length > 0) {
            const currentId = queue.pop();
            if (currentId === nodeId) continue;

            for (const edge of graph.edges) {
                if (edge.source === currentId) {
                    if (!reachableNodes.has(edge.target) && edge.target !== nodeId) {
                        reachableNodes.add(edge.target);
                        queue.push(edge.target);
                    }
                } else if (edge.target === currentId) {
                    if (!reachableNodes.has(edge.source) && edge.source !== nodeId) {
                        reachableNodes.add(edge.source);
                        queue.push(edge.source);
                    }
                }
            }
        }

        setGraph((oldGraph) => ({
            nodes: oldGraph.nodes.filter((node) => reachableNodes.has(node.id)),
            edges: oldGraph.edges.filter(
                (edge) => reachableNodes.has(edge.source) && reachableNodes.has(edge.target),
            ),
        }));
    };

    const expandGraph = (nodeType: MediaType, malId: string) => {
        if (!malId || (nodeType !== 'anime' && nodeType !== 'manga')) {
            return;
        }

        setLoading(true);
        setProgress(0);

        const controller = new AbortController();
        abortControllersRef.current.add(controller);
        fetchJikanGraph(nodeType, malId, controller.signal, graph.nodes.filter((node) => node.nodeType).map((node) => node.id))
            .then((newGraph) => {
                if (newGraph) {
                    setGraph((oldGraph) => {
                        return {
                            nodes: [...oldGraph.nodes.filter((o) => !newGraph.nodes.find((n) => n.id === o.id)), ...newGraph.nodes],
                            edges: [...oldGraph.edges, ...newGraph.edges],
                        };
                    });
                }
            })
            .finally(() => {
                abortControllersRef.current.delete(controller);
                if (!controller.signal.aborted && abortControllersRef.current.size === 0) {
                    setLoading(false);
                }
            });
    };

    useEffect(() => {
        if (!sourceId || (sourceType !== 'anime' && sourceType !== 'manga')) {
            return;
        }

        setLoading(true);
        setGraph({ nodes: [], edges: [] });
        setProgress(0);

        const controller = new AbortController();
        abortControllersRef.current.add(controller);
        fetchJikanGraph(sourceType, sourceId, controller.signal)
            .then((graph) => {
                if (graph) {
                    setGraph(graph);
                }
            })
            .finally(() => {
                abortControllersRef.current.delete(controller);
                if (!controller.signal.aborted && abortControllersRef.current.size === 0) {
                    setLoading(false);
                }
            });

        return () => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            for (const c of abortControllersRef.current) {
                c.abort();
            }
            abortControllersRef.current.clear();
        }
    }, [sourceType, sourceId, fetchJikanGraph]);

    return { graph, loading, progress, deleteSubgraph, expandGraph };
}
