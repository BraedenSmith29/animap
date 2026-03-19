import { useEffect, useState } from 'react';
import { AniMapCanvas } from '../components';
import type { GraphResponse } from '../types/graph.ts';
import { useParams } from 'react-router';
import { SearchBar } from '../components/searchBar/SearchBar.tsx';

export function Graph() {
    const { animeId } = useParams();
    const [graph, setGraph] = useState<GraphResponse>({ anime: [], edges: [] });

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
        <div style={{ position: 'relative', zIndex: 1, margin: 10 }}>
            <SearchBar />
        </div>
        <AniMapCanvas nodes={graph.anime} edges={graph.edges} />
    </>;
}
