import { useCallback, useEffect, useState } from 'react';
import type { Graph, MediaType } from '../types/graph.ts';
import type { Anime, Manga } from '@tutkli/jikan-ts/types';
import { useJikanClientContext } from '../contexts/JikanClientContext.tsx';
import {
    getDurationMinutes,
    getEnglishTitle,
    getJapaneseTitle,
    getNodeImage,
    getPortraitImage,
    getTitle,
    isNsfw,
} from '../utils/jikanProcessing.ts';

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

            let item: Anime | Manga;
            if (type === 'anime') {
                item = await jikanClient.getDetails(type, currentId, signal) as Anime;
                if (!item) continue;
                newGraph.nodes.push({
                    id: 'anime' + currentId,
                    label: getTitle(item.titles) ?? 'Unknown Anime',
                    nodeType: 'anime',
                    anime: {
                        malId: item.mal_id.toString(),
                        title: getTitle(item.titles),
                        enTitle: getEnglishTitle(item.titles),
                        jaTitle: getJapaneseTitle(item.titles),
                        portraitImage: getPortraitImage(item.images),
                        nodeImage: getNodeImage(item.images),
                        startDate: item.aired.from,
                        endDate: item.aired.to,
                        synopsis: item.synopsis,
                        score: item.score,
                        members: item.members,
                        nsfw: isNsfw(item),
                        mediaType: item.type,
                        status: item.status,
                        episodes: item.episodes,
                        source: item.source,
                        duration: getDurationMinutes(item.duration),
                        rating: item.rating ?? null,
                    },
                });
            } else if (type === 'manga') {
                item = await jikanClient.getDetails(type, currentId, signal) as Manga;
                if (!item) continue;
                newGraph.nodes.push({
                    id: 'manga' + currentId,
                    label: getTitle(item.titles) ?? 'Unknown Manga',
                    nodeType: 'manga',
                    manga: {
                        malId: item.mal_id.toString(),
                        title: getTitle(item.titles),
                        enTitle: getEnglishTitle(item.titles),
                        jaTitle: getJapaneseTitle(item.titles),
                        portraitImage: getPortraitImage(item.images),
                        nodeImage: getNodeImage(item.images),
                        startDate: item.published.from,
                        endDate: item.published.to,
                        synopsis: item.synopsis,
                        score: item.score,
                        members: item.members,
                        nsfw: isNsfw(item),
                        mediaType: item.type,
                        status: item.status,
                        volumes: item.volumes,
                        chapters: item.chapters,
                    },
                });
            } else {
                continue;
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
                    setLoading(false);
                }
            });

        return () => {
            controller.abort();
        };
    }, [sourceId, fetchJikanGraph]);

    return { graph, loading };
}
