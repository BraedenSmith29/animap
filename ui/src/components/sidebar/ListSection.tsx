import { Button } from '@/components';
import { useMemo } from 'react';
import { useMalIntegration } from '@/context/malIntegration';
import type { Anime, Manga, MediaType } from '@/types';

interface Props {
    mediaType: MediaType
    media: Anime | Manga;
}

const formatNumber = (value: number | null) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return 'Unknown';
    }

    return value.toLocaleString();
};

export function ListSection({ mediaType, media }: Props) {
    const { isAuthenticated, animangaList, addToList } = useMalIntegration();

    const inList = useMemo(() => {
        return animangaList.some((item) => item.id === mediaType + media.malId);
    }, [animangaList, mediaType, media.malId]);

    if (isAuthenticated()) {
        return <>
            <div className="sidebar__stat-card">
                <span className="sidebar__stat-label">Users</span>
                <span className="sidebar__stat-value">{formatNumber(media.members)}</span>
            </div>
            <div className="sidebar__stat-card">
                <span className="sidebar__stat-label">List Status</span>
                <span className="sidebar__stat-value">N/A</span>
            </div>

            {!inList ? (
                <div className="sidebar__stat-card sidebar__stat-card--community-score">
                    <div className="sidebar__stat-card-contents">
                        <span className="sidebar__stat-label">Community Score</span>
                        <span className="sidebar__stat-value">{formatNumber(media.score)}</span>
                    </div>

                    <Button
                        variant="primary"
                        size="large"
                        onClick={() => addToList(mediaType, media.malId)}
                    >
                        Add to List
                    </Button>
                </div>
            ) : (
                <>
                    <div className="sidebar__stat-card">
                        <span className="sidebar__stat-label">Community Score</span>
                        <span className="sidebar__stat-value">{formatNumber(media.score)}</span>
                    </div>
                    <div className="sidebar__stat-card">
                        <span className="sidebar__stat-label">Your Score</span>
                        <span className="sidebar__stat-value">N/A</span>
                    </div>
                </>
            )}
        </>;
    } else {
        return <>
            <div className="sidebar__stat-card">
                <span className="sidebar__stat-label">Community Score</span>
                <span className="sidebar__stat-value">{formatNumber(media.score)}</span>
            </div>
            <div className="sidebar__stat-card">
                <span className="sidebar__stat-label">Users</span>
                <span className="sidebar__stat-value">{formatNumber(media.members)}</span>
            </div>
        </>;
    }
}
