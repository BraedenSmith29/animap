import type { FullNode, MediaType } from '@/types';
import { AnimeDetailsSidebar } from '@/components/sidebar/AnimeDetailsSidebar.tsx';
import { MangaDetailsSidebar } from '@/components/sidebar/MangaDetailsSidebar.tsx';

type Props = {
    node: FullNode;
    isClosing: boolean;
    onClose: () => void;
    onClosed: () => void;
    deleteSubgraph: (nodeId: string) => void;
    expandGraph: (nodeType: MediaType, nodeId: string) => void;
};

export function DetailsSidebar({ node, isClosing, onClose, onClosed, deleteSubgraph }: Props) {
    if (node.nodeType === 'anime') {
        return <AnimeDetailsSidebar
            anime={node.data}
            isClosing={isClosing}
            onClose={onClose}
            onClosed={onClosed}
            onDelete={deleteSubgraph}
        />;
    } else if (node.nodeType === 'manga') {
        return <MangaDetailsSidebar
            manga={node.data}
            isClosing={isClosing}
            onClose={onClose}
            onClosed={onClosed}
            onDelete={deleteSubgraph}
        />;
    }
}
