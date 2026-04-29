import type { FullNode } from '@/types';
import { AnimeDetailsSidebar } from '@/components/sidebar/AnimeDetailsSidebar.tsx';
import { MangaDetailsSidebar } from '@/components/sidebar/MangaDetailsSidebar.tsx';
import { Icon } from '@/components';
import { useCallback, useState } from 'react';
import { useClickOutside } from '@/hooks';

type Props = {
    node: FullNode;
    isClosing: boolean;
    onClose: () => void;
    onClosed: () => void;
    deleteSubgraph: (nodeId: string) => void;
};

export function DetailsSidebar({ node, isClosing, onClose, onClosed, deleteSubgraph }: Props) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useClickOutside<HTMLDivElement>(useCallback(() => setIsMenuOpen(false), []));

    return (
        <aside
            className={`sidebar ${isClosing ? 'sidebar--closing' : ''}`.trim()}
            onAnimationEnd={() => {
                if (isClosing) {
                    onClosed();
                }
            }}
        >
            <div className="sidebar__header">
                <button type="button" className="sidebar__header-button" onClick={onClose}
                        aria-label="Close sidebar">
                    <Icon type="close" />
                </button>
                <p className="sidebar__heading">Details</p>
                <div ref={menuRef}>
                    <button
                        type="button"
                        className="sidebar__header-button"
                        aria-label="Options"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <Icon type="dots-three" />
                    </button>

                    {isMenuOpen && (
                        <div className="sidebar__menu">
                            <button
                                type="button"
                                className="sidebar__menu-item sidebar__menu-item--danger"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onClose();
                                    deleteSubgraph(node.id);
                                }}
                            >
                                <Icon type="close" />
                                Delete Node
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="sidebar__content">
                {node.nodeType === 'anime'
                    ? <AnimeDetailsSidebar anime={node.data} />
                    : <MangaDetailsSidebar manga={node.data} />
                }
            </div>
        </aside>
    );
}
