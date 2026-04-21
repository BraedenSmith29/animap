import './Graph.css';
import { useEffect, useState } from 'react';
import { AniMapCanvas, DetailsSidebar, SearchBar } from '@/components';
import { useJikanGraph } from '@/hooks';
import type { Node } from '@/types';
import { Link, useParams } from 'react-router';
import { LoadingScreen } from '@/components/loadingScreen/LoadingScreen.tsx';

export function Graph() {
    const { type, id } = useParams();
    const { graph, loading, progress, deleteSubgraph } = useJikanGraph(type, id);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [isSidebarClosing, setIsSidebarClosing] = useState(false);

    const handleSelectedNode = (node: Node | null) => {
        if (node) {
            setIsSidebarClosing(false);
            setSelectedNode(node);
            return;
        }

        if (selectedNode) {
            setIsSidebarClosing(true);
        }
    };

    useEffect(() => {
        handleSelectedNode(null);
    }, [type, id]);

    return <>
        <div className="graph__header">
            <Link to="/" className="graph__header-title">Ani<span>Map</span></Link>
            <SearchBar />
        </div>
        {loading
            ? <LoadingScreen progress={progress} />
            : <AniMapCanvas graph={graph} setSelectedNode={handleSelectedNode} deleteSubgraph={deleteSubgraph} />
        }
        {selectedNode && (
            <DetailsSidebar
                node={selectedNode}
                isClosing={isSidebarClosing}
                onClose={() => handleSelectedNode(null)}
                onClosed={() => {
                    setSelectedNode(null);
                    setIsSidebarClosing(false);
                }}
            />
        )}
    </>;
}
