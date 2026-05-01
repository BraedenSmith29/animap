import type { FullNode } from '@/types';
import { AnimeStats } from '@/components/sidebar/AnimeStats.tsx';
import { MangaStats } from '@/components/sidebar/MangaStats.tsx';
import { Button, Icon } from '@/components';
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

    const title = node.data.title || 'Untitled';

    if (node.id === 'manga78003') {
        console.log(node.data.synopsis?.replace(/\n/g, '&nbsp'));
    }

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
                <div className="sidebar__image-border">
                    {node.data.portraitImage ? (
                        <img className="sidebar__image" src={node.data.portraitImage} alt={`Cover for ${title}`} />
                    ) : (
                        <span className="sidebar__image-fallback">No cover image</span>
                    )}
                </div>

                <Button
                    variant="secondary"
                    size="large"
                    href={`https://myanimelist.net/${node.nodeType}/${node.data.malId}`}
                >
                    View on MyAnimeList
                </Button>

                <div className="sidebar__titles-section">
                    <h2 className="sidebar__title">{title}</h2>
                    {node.data.enTitle && <p className="sidebar__subtitle">{node.data.enTitle}</p>}
                    {node.data.jaTitle && <p className="sidebar__subtitle">{node.data.jaTitle}</p>}
                </div>

                {node.data.nsfw && (
                    <div className="sidebar__nsfw-banner">
                        <span className="sidebar__nsfw-text">This title is marked as NSFW</span>
                    </div>
                )}

                {node.nodeType === 'anime'
                    ? <AnimeStats anime={node.data} />
                    : <MangaStats manga={node.data} />
                }

                <p className="sidebar__synopsis">{node.data.synopsis || 'No synopsis available.'}</p>
            </div>
        </aside>
    );
}
