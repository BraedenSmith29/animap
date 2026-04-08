import type { Node } from '@/types';
import { AnimeDetailsSidebar, MangaDetailsSidebar } from '@/components/sidebar';

type Props = {
    node: Node;
    isClosing: boolean;
    onClose: () => void;
    onClosed: () => void;
};

export function DetailsSidebar({ node, isClosing, onClose, onClosed }: Props) {
    if (node.nodeType === 'anime') {
        return <AnimeDetailsSidebar anime={node.anime} isClosing={isClosing} onClose={onClose} onClosed={onClosed} />;
    } else if (node.nodeType === 'manga') {
        return <MangaDetailsSidebar manga={node.manga} isClosing={isClosing} onClose={onClose} onClosed={onClosed} />;
    }
}
