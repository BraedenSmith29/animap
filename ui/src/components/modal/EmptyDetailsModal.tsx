import './EmptyDetailsModal.css';
import type { EmptyNode, MediaType } from '@/types';
import { Button } from '@/components/button';
import { Icon } from '@/components';

type Props = {
    node: EmptyNode;
    onClose: () => void;
    onDelete: (nodeId: string) => void;
    onExpand: (nodeType: MediaType, malId: string) => void;
};

export function EmptyDetailsModal({ node, onClose, onDelete, onExpand }: Props) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button 
                    type="button" 
                    className="modal__close" 
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <Icon type="close" />
                </button>

                <h2 className="modal__title">{node.label}</h2>
                <p className="modal__subtitle">{node.mediaType}</p>

                <div className="modal__content">
                    <p>This was not loaded because it appears to be related by a crossover and may not actually be a
                        part of this series. If it is a part of the series, you can load the subgraph. Otherwise, you
                        can delete the node or simply leave it as is.</p>
                </div>

                <div className="modal__actions">
                    <Button
                        variant="secondary"
                        size="large"
                        className="modal__button"
                        href={`https://myanimelist.net/${node.mediaType}/${node.malId}`}
                    >
                        View on MyAnimeList
                    </Button>
                    <Button
                        variant="primary"
                        size="large"
                        className="modal__button"
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
                        className="modal__button"
                        onClick={() => {
                            onClose();
                            onDelete(node.id);
                        }}
                    >
                        Delete Node
                    </Button>
                </div>
            </div>
        </div>
    );
}
