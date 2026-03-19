import {useCallback, useEffect, useState} from 'react'
import './App.css'
import {GraphCanvas} from "reagraph";

interface Anime {
    id: string;
    label: string;
    title: string;
    en_title: string;
    jp_title: string;
    main_picture: {
        medium: string;
        large: string;
    }
}

interface Edge {
    source: string;
    target: string;
    id: string;
    label: string;
}

function App() {
    const [graph, setGraph] = useState<{ anime: Anime[]; edges: Edge[] }>({anime: [], edges: []});

    const updateGraph = useCallback(() => {
        fetch('/api/v1/fetchGraph/22297')
            .then(res => res.json())
            .then(setGraph);
    }, []);

    useEffect(updateGraph, [updateGraph]);

    return (
        <>
            <section id="center">
                <div style={{position: 'relative', width: '75%', height: '1000px'}}>
                    <GraphCanvas nodes={graph.anime} edges={graph.edges} labelType="all"/>
                </div>
            </section>
        </>
    )
}

export default App
