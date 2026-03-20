import './Graph.css';
import { useEffect, useState } from 'react';
import { AniMapCanvas, AnimeDetailsSidebar } from '../components';
import type { Anime, Graph } from '../types/graph.ts';
import { Link, useParams } from 'react-router';
import { SearchBar } from '../components/searchBar/SearchBar.tsx';

export function Graph() {
    const { animeId } = useParams();
    const [graph, setGraph] = useState<Graph>({ nodes: [], edges: [] });
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

    useEffect(() => {
        if (localStorage.getItem(`graph-${animeId}`)) {
            setGraph(JSON.parse(localStorage.getItem(`graph-${animeId}`)!));
        } else {
            fetch(`/api/v1/fetchGraph/${animeId}`)
                .then(res => res.json())
                .then((body) => {
                    setGraph(body.graph);
                    localStorage.setItem(`graph-${animeId}`, JSON.stringify(body.graph));
                });
        }
    }, [animeId]);

    return <>
        <div className="graph__header">
            <Link to="/" className="graph__header-title">Ani<span>Map</span></Link>
            <SearchBar />
        </div>
        <AniMapCanvas graph={graph} setSelectedAnime={handleSelectedAnime} />
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
