import { darkTheme, GraphCanvas } from 'reagraph';
import { GraphNodeIcon } from './GraphNodeIcon.tsx';
import type { Anime, Edge } from '../types/graph';

interface Props {
    nodes: Anime[];
    edges: Edge[];
}

export function AniMapCanvas({ nodes, edges }: Props) {
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
                    return <GraphNodeIcon malUrl={(node as unknown as Anime).main_picture.large} />;
                }}
            />
        </div>
    );
}

