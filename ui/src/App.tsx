import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { AniMapCanvas } from './components'
import type { GraphResponse } from './types/graph'

function App() {
    const key = "59978";
    const [graph, setGraph] = useState<GraphResponse>({ anime: [], edges: [] });

    const updateGraph = useCallback(() => {
        fetch(`/api/v1/fetchGraph/${key}`)
            .then(res => res.json())
            .then(setGraph);
    }, []);

    useEffect(updateGraph, [updateGraph]);

    return (
        <>
            <section id="center">
                <AniMapCanvas nodes={graph.anime} edges={graph.edges} />
            </section>
        </>
    )
}

export default App
