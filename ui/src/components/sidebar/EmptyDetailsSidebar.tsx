import { useCallback, useState } from 'react';
import './DetailsSidebar.css';
import type { EmptyNode, MediaType } from '@/types';
import { Icon } from '@/components/Icon';
import { Button } from '@/components/button';
import { useClickOutside } from '@/hooks';

type Props = {
    node: EmptyNode;
    isClosing: boolean;
    onClose: () => void;
    onClosed: () => void;
    onDelete: (nodeId: string) => void;
    onExpand: (nodeType: MediaType, malId: string) => void;
};

export function EmptyDetailsSidebar({ node, isClosing, onClose, onClosed, onDelete, onExpand }: Props) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useClickOutside<HTMLDivElement>(useCallback(() => setIsMenuOpen(false), []));
    const title = node.label || 'Unknown Title';
    const typeLabel = node.mediaType.charAt(0).toUpperCase() + node.mediaType.slice(1);

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
                <button type="button" className="sidebar__header-button" onClick={onClose} aria-label="Close sidebar">
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
                                    onDelete(node.id);
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
                <Button
                    variant="secondary"
                    size="large"
                    className="sidebar__button"
                    href={`https://myanimelist.net/${node.mediaType}/${node.malId}`}
                >
                    View on MyAnimeList
                </Button>

                <h2 className="sidebar__title">{title}</h2>
                <p className="sidebar__subtitle">{typeLabel}</p>

                <div className="sidebar__meta-card">
                    <p>This was not loaded because it appears to be related by a crossover and may not actually be a
                        part of this series. If it is a part of the series, you can load the subgraph. Otherwise, you
                        can delete the node or simply leave it as is.</p>
                </div>

                <div className="sidebar__actions">
                    <Button
                        variant="primary"
                        size="large"
                        className="sidebar__button"
                        onClick={() => {
                            onClose();
                            onExpand(node.mediaType, node.malId);
                        }}
                    >
                        Load Subgraph
                    </Button>
                    <Button
                        variant="danger"
                        size="large"
                        className="sidebar__button"
                        onClick={() => {
                            onClose();
                            onDelete(node.id);
                        }}
                    >
                        Delete Node
                    </Button>
                </div>
            </div>
        </aside>
    );
}
