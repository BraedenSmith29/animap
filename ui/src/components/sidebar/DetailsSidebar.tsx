import type { MediaType, Node } from '@/types';
import { AnimeDetailsSidebar } from '@/components/sidebar/AnimeDetailsSidebar.tsx';
import { MangaDetailsSidebar } from '@/components/sidebar/MangaDetailsSidebar.tsx';
import { EmptyDetailsSidebar } from '@/components/sidebar/EmptyDetailsSidebar.tsx';

type Props = {
    node: Node;
    isClosing: boolean;
    onClose: () => void;
    onClosed: () => void;
    deleteSubgraph: (nodeId: string) => void;
    expandGraph: (nodeType: MediaType, nodeId: string) => void;
};

export function DetailsSidebar({ node, isClosing, onClose, onClosed, deleteSubgraph, expandGraph }: Props) {
    if (node.nodeType === 'anime') {
        return <AnimeDetailsSidebar
            anime={node.anime}
            isClosing={isClosing}
            onClose={onClose}
            onClosed={onClosed}
            onDelete={deleteSubgraph}
        />;
    } else if (node.nodeType === 'manga') {
        return <MangaDetailsSidebar
            manga={node.manga}
            isClosing={isClosing}
            onClose={onClose}
            onClosed={onClosed}
            onDelete={deleteSubgraph}
        />;
    } else if (node.nodeType === null) {
        return <EmptyDetailsSidebar
            node={node}
            isClosing={isClosing}
            onClose={onClose}
            onClosed={onClosed}
            onDelete={deleteSubgraph}
            onExpand={expandGraph}
        />;
    }
}
