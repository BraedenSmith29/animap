import { darkTheme, GraphCanvas } from 'reagraph';
import { GraphNodeIcon } from './GraphNodeIcon.tsx';
import type { Anime, Edge } from '../types/graph';

interface Props {
    nodes: Anime[];
    edges: Edge[];
    setSelectedAnime: (anime: Anime | null) => void;
}

export function AniMapCanvas({ nodes, edges, setSelectedAnime }: Props) {
    return (
        <div>
            <GraphCanvas
                nodes={nodes}
                edges={edges}
                theme={darkTheme}
                labelType="all"
                draggable={true}
                layoutType="treeLr2d"
                renderNode={({ node }) => {
                    return <GraphNodeIcon malUrl={(node as unknown as Anime).main_picture.large || ''} />;
                }}
                onNodeClick={(node) => setSelectedAnime(node as unknown as Anime)}
                onCanvasClick={() => setSelectedAnime(null)}
            />
        </div>
    );
}

