import './DetailsSidebar.css';
import type { Anime } from '@/types';
import { ListSection } from '@/components/sidebar/ListSection.tsx';

type Props = {
    anime: Anime;
};

export function AnimeStats({ anime }: Props) {
    let runtime;
    if (anime.duration && anime.duration > 1) {
        const hours = Math.floor(anime.duration / 60);
        const minutes = Math.floor(anime.duration % 60);
        if (hours > 0 && minutes > 0) {
            runtime = `${hours}h ${minutes}m`;
        } else if (hours > 0) {
            runtime = `${hours}h`;
        } else {
            runtime = `${minutes}m`;
        }
    } else {
        runtime = 'Unknown';
    }

    const includeEndDate = anime.endDate || anime.status === 'Currently Airing';

    return <>
        <div className="sidebar__stat-card">
            <span className="sidebar__stat-label">Type</span>
            <span className="sidebar__stat-value">{anime.mediaType ?? 'Anime'}</span>
        </div>
        {anime.episodes && anime.episodes > 1 ?
            <div className="sidebar__stat-card">
                <span className="sidebar__stat-label">Episodes</span>
                <span className="sidebar__stat-value">{anime.episodes}</span>
            </div>
            : <div className="sidebar__stat-card">
                <span className="sidebar__stat-label">Runtime</span>
                <span
                    className="sidebar__stat-value">{runtime}</span>
            </div>
        }
        <ListSection mediaType="anime" media={anime} />
        <div className="sidebar__stat-card">
            <span className="sidebar__stat-label">Source</span>
            <span className="sidebar__stat-value">{anime.source ?? 'Unknown'}</span>
        </div>
        <div className="sidebar__stat-card">
            <span className="sidebar__stat-label">Rating</span>
            <span className="sidebar__stat-value">{anime.rating ?? 'Unknown'}</span>
        </div>
        <div className="sidebar__stat-card sidebar__stat-card--release-status">
            <span className="sidebar__stat-label">Airing Status</span>
            <span className="sidebar__stat-value">{anime.status ?? 'Unknown'}</span>
            <span className="sidebar__stat-value">
                Aired: {anime.startDate ?? 'Unknown'}{includeEndDate && ` - ${anime.endDate}`}
            </span>
        </div>
    </>;
}
