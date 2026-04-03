import { useCallback, useEffect, useState } from 'react';
import type { Graph } from '../types/graph.ts';
import { useJikanClient } from './useJikanClient.ts';
import type { Anime, JikanImages, JikanResourceTitle, Manga } from '@tutkli/jikan-ts/types';

const NSFW_GENRES = [9, 12, 49];

function getPortraitImage(images: JikanImages): string | null {
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

function getTitle(titles: JikanResourceTitle[]): string | null {
    return titles.find(t => t.type === 'Default')?.title ?? null;
}

function getEnglishTitle(titles: JikanResourceTitle[]): string | null {
    return titles.find(t => t.type === 'English')?.title ?? null;
}

function getJapaneseTitle(titles: JikanResourceTitle[]): string | null {
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
        if (!sourceId) {
            return;
        }

        setLoading(true);
        setGraph({ nodes: [], edges: [] });

        const controller = new AbortController();
        fetchJikanGraph(sourceId, controller.signal)
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
