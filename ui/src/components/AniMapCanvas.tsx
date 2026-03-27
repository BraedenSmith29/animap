import { useMemo } from 'react';
import { darkTheme, GraphCanvas } from 'reagraph';
import type { Theme } from 'reagraph';
import { GraphNodeIcon } from './GraphNodeIcon.tsx';
import type { Node, Graph } from '../types/graph';

interface Props {
    graph: Graph;
    setSelectedNode: (node: Node | null) => void;
}

export function AniMapCanvas({ graph, setSelectedNode }: Props) {
    const graphTheme = useMemo<Theme>(() => {
        if (typeof window === 'undefined') {
            return darkTheme;
        }

        const rootStyles = window.getComputedStyle(document.documentElement);
        const token = (name: string, fallback: string) => rootStyles.getPropertyValue(name).trim() || fallback;

        return {
            ...darkTheme,
            canvas: {
                ...darkTheme.canvas,
                background: token('--color-bg-primary', '#0f121a'),
            },
            node: {
                ...darkTheme.node,
                fill: token('--color-text-tertiary', '#6f7689'),
                activeFill: token('--color-accent-primary', '#8ca8ff'),
                label: {
                    ...darkTheme.node.label,
                    color: token('--color-text-secondary', '#a2a9b9'),
                    activeColor: token('--color-text-primary', '#eef1f7'),
                    strokeColor: token('--color-border-primary', '#2b3242'),
                },
            },
            edge: {
                ...darkTheme.edge,
                fill: token('--graph-edge-fill', '#4d5568'),
                activeFill: token('--color-accent-primary', '#8ca8ff'),
                label: {
                    ...darkTheme.edge.label,
                    color: token('--color-text-secondary', '#a2a9b9'),
                    activeColor: token('--color-text-primary', '#eef1f7'),
                },
            },
            arrow: {
                ...darkTheme.arrow,
                fill: token('--graph-edge-fill', '#4d5568'),
                activeFill: token('--color-accent-primary', '#8ca8ff'),
            },
        };
    }, []);

    return (
        <div>
            <GraphCanvas
                nodes={graph.nodes}
                edges={graph.edges}
                theme={graphTheme}
                labelType="all"
                draggable={true}
                layoutType="treeLr2d"
                renderNode={({ node }) => {
                    const n = node as unknown as Node;
                    if (n.nodeType === 'anime') {
                        return <GraphNodeIcon malUrl={n.anime.mainPicture || ''} />;
                    } else if (n.nodeType === 'manga') {
                        return <GraphNodeIcon malUrl={n.manga.mainPicture || ''} />;
                    } else {
                        return null;
                    }
                }}
                onNodeClick={(node) => setSelectedNode(node as unknown as Node)}
                onCanvasClick={() => setSelectedNode(null)}
            />
        </div>
    );
}

