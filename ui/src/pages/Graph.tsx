import './Graph.css';
import { useEffect, useState } from 'react';
import { AniMapCanvas, DetailsSidebar, EmptyDetailsModal, SearchBar } from '@/components';
import { useTenraiGraph } from '@/hooks';
import type { Node } from '@/types';
import { Link, useParams } from 'react-router';
import { LoadingScreen } from '@/components/loadingScreen/LoadingScreen.tsx';

export function Graph() {
    const { type, id } = useParams();
    const { graph, loading, progress, error, deleteSubgraph, expandGraph } = useTenraiGraph(type, id);
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
        setIsSidebarClosing(true);
    }, [type, id]);

    return <>
        <div className="graph__header">
            <Link to="/" className="graph__header-title">Ani<span>Map</span></Link>
            <SearchBar onGraphPage={true} />
        </div>
        {error ? (
            <div className="error__overlay">
                <p>{error}</p>
            </div>
        ) : <>
            {loading
                ? <LoadingScreen progress={progress} />
                : <AniMapCanvas graph={graph} setSelectedNode={handleSelectedNode} />
            }
            {selectedNode && selectedNode.nodeType !== null && (
                <DetailsSidebar
                    node={selectedNode}
                    isClosing={isSidebarClosing}
                    onClose={() => handleSelectedNode(null)}
                    onClosed={() => {
                        setSelectedNode(null);
                        setIsSidebarClosing(false);
                    }}
                    deleteSubgraph={deleteSubgraph}
                />
            )}
            {selectedNode && selectedNode.nodeType === null && (
                <EmptyDetailsModal
                    node={selectedNode}
                    onClose={() => setSelectedNode(null)}
                    onDelete={deleteSubgraph}
                    onExpand={expandGraph}
                />
            )}
        </>}
    </>;
}
