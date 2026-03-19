import { useEffect, useState } from 'react';
import { AniMapCanvas, AnimeDetailsSidebar } from '../components';
import type { Anime, GraphResponse } from '../types/graph.ts';
import { useParams } from 'react-router';
import { SearchBar } from '../components/searchBar/SearchBar.tsx';

export function Graph() {
    const { animeId } = useParams();
    const [graph, setGraph] = useState<GraphResponse>({ anime: [], edges: [] });
    const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
    const [isSidebarClosing, setIsSidebarClosing] = useState(false);

    const handleSelectedAnime = (anime: Anime | null) => {
        if (anime) {
            setIsSidebarClosing(false);
            setSelectedAnime(anime);
            return;
        }

        if (selectedAnime) {
            setIsSidebarClosing(true);
        }
    };

    const updateGraph = () => {
        if (localStorage.getItem(`graph-${animeId}`)) {
            setGraph(JSON.parse(localStorage.getItem(`graph-${animeId}`)!));
        } else {
            fetch(`/api/v1/fetchGraph/${animeId}`)
                .then(res => res.json())
                .then((graph) => {
                    setGraph(graph);
                    localStorage.setItem(`graph-${animeId}`, JSON.stringify(graph));
                });
        }
    };

    useEffect(updateGraph, [animeId]);

    return <>
        <div style={{ position: 'relative', margin: 10, zIndex: 1 }}>
            <SearchBar />
        </div>
        <AniMapCanvas nodes={graph.anime} edges={graph.edges} setSelectedAnime={handleSelectedAnime} />
        {selectedAnime && (
            <AnimeDetailsSidebar
                anime={selectedAnime}
                isClosing={isSidebarClosing}
                onClose={() => handleSelectedAnime(null)}
                onClosed={() => {
                    setSelectedAnime(null);
                    setIsSidebarClosing(false);
                }}
            />
        )}
    </>;
}
