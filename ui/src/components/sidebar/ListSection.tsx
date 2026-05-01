import { Button } from '@/components';
import { useMemo } from 'react';
import { useMalIntegration } from '@/context/malIntegration';
import type { Anime, Manga, MediaType } from '@/types';

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

    let listStatus;
    switch (listItem?.status) {
        case 'watching':
            listStatus = 'Watching';
            break;
        case 'reading':
            listStatus = 'Reading';
            break;
        case 'completed':
            listStatus = 'Completed';
            break;
        case 'on_hold':
            listStatus = 'On Hold';
            break;
        case 'dropped':
            listStatus = 'Dropped';
            break;
        case 'plan_to_watch':
            listStatus = 'Plan to Watch';
            break;
        case 'plan_to_read':
            listStatus = 'Plan to Read';
            break;
        default:
            listStatus = 'N/A';
    }

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
