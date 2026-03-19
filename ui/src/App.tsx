import { useCallback, useEffect, useState } from 'react'
import { AniMapCanvas } from './components'
import type { GraphResponse } from './types/graph'
import { useParams } from "react-router";

function App() {
    const { animeId: key } = useParams();
    const [graph, setGraph] = useState<GraphResponse>({ anime: [], edges: [] });

    const updateGraph = useCallback(() => {
        if (localStorage.getItem(`graph-${key}`)) {
            setGraph(JSON.parse(localStorage.getItem(`graph-${key}`)!));
        } else {
            fetch(`/api/v1/fetchGraph/${key}`)
                .then(res => res.json())
                .then((graph) => {
                    setGraph(graph);
                    localStorage.setItem(`graph-${key}`, JSON.stringify(graph));
                });
        }
    }, []);

    useEffect(updateGraph, [updateGraph]);

    return <AniMapCanvas nodes={graph.anime} edges={graph.edges} />;
}

export default App
