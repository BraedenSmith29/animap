import { Button } from '@/components';
import { useMemo } from 'react';
import { useMalIntegration } from '@/context/malIntegration';
import type { Anime, Manga, MediaType } from '@/types';

const STATUS_MAP: Record<string, string> = {
    watching: 'Watching',
    reading: 'Reading',
    completed: 'Completed',
    on_hold: 'On Hold',
    dropped: 'Dropped',
    plan_to_watch: 'Plan to Watch',
    plan_to_read: 'Plan to Read',
};

interface Props {
    mediaType: MediaType;
    media: Anime | Manga;
}

export function ListSection({ mediaType, media }: Props) {
    const { isAuthenticated, animangaList, addToList } = useMalIntegration();

    const listItem = useMemo(() => {
        return animangaList.find((item) => item.id === mediaType + media.malId);
    }, [animangaList, mediaType, media.malId]);

    const members = media.members?.toLocaleString() ?? 'Unknown';
    const communityScore = media.score?.toLocaleString() ?? 'Unknown';

    const listStatus = (listItem?.status && STATUS_MAP[listItem.status]) || 'N/A';

    if (isAuthenticated()) {
        return <>
            <div className="sidebar__stat-card">
                <span className="sidebar__stat-label">Users</span>
                <span className="sidebar__stat-value">{members}</span>
            </div>
            <div className="sidebar__stat-card">
                <span className="sidebar__stat-label">List Status</span>
                <span className="sidebar__stat-value">{listStatus}</span>
            </div>

            {!listItem ? (
                <div className="sidebar__stat-card sidebar__stat-card--community-score">
                    <div className="sidebar__stat-card-contents">
                        <span className="sidebar__stat-label">Community Score</span>
                        <span className="sidebar__stat-value">{communityScore}</span>
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
                        <span className="sidebar__stat-value">{communityScore}</span>
                    </div>
                    <div className="sidebar__stat-card">
                        <span className="sidebar__stat-label">Your Score</span>
                        <span className="sidebar__stat-value">{listItem.score || 'N/A'}</span>
                    </div>
                </>
            )}
        </>;
    } else {
        return <>
            <div className="sidebar__stat-card">
                <span className="sidebar__stat-label">Community Score</span>
                <span className="sidebar__stat-value">{communityScore}</span>
            </div>
            <div className="sidebar__stat-card">
                <span className="sidebar__stat-label">Users</span>
                <span className="sidebar__stat-value">{members}</span>
            </div>
        </>;
    }
}
