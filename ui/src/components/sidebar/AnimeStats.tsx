import './DetailsSidebar.css';
import type { Anime } from '@/types';
import { ListSection } from '@/components/sidebar/ListSection.tsx';

type Props = {
    anime: Anime;
};

const formatEnumValue = (value?: string | null) => {
    if (!value) {
        return '-';
    }

    return value
        .replaceAll('_', ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const formatMonthYear = (value: string | null) => {
    if (!value) {
        return 'Unknown';
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(parsedDate);
};

const formatNumber = (value: number | null) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return 'Unknown';
    }

    return value.toLocaleString();
};

const formatRuntime = (totalMinutes: number | null) => {
    if (typeof totalMinutes !== 'number' || Number.isNaN(totalMinutes)) {
        return 'Unknown';
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h`;
    } else if (minutes > 0) {
        return `${minutes}m`;
    } else {
        return 'N/A';
    }
};

const getAiringLabel = (airingStatus: string | null) => {
    if (airingStatus === 'Finished Airing') {
        return 'Aired';
    } else if (airingStatus === 'Currently Airing') {
        return 'Airing';
    } else if (airingStatus === 'Not yet aired') {
        return 'Airing';
    }
};

const getAiringDates = (airingStatus: string | null, startDate: string | null, endDate: string | null) => {
    const start = startDate ?? 'Unknown';
    let end = endDate;

    if (end == null && airingStatus === 'Currently Airing') {
        end = 'Unknown';
    }

    if (end) {
        return `${formatMonthYear(start)} - ${formatMonthYear(end)}`;
    } else {
        return formatMonthYear(start);
    }
};

export function AnimeStats({ anime }: Props) {
    return (
        <>
            <div className="sidebar__stats-grid">
                <div className="sidebar__stat-card">
                    <span className="sidebar__stat-label">Type</span>
                    <span className="sidebar__stat-value">{formatEnumValue(anime.mediaType)}</span>
                </div>
                {anime.episodes && anime.episodes > 1 ?
                    <div className="sidebar__stat-card">
                        <span className="sidebar__stat-label">Episodes</span>
                        <span className="sidebar__stat-value">{formatNumber(anime.episodes)}</span>
                    </div>
                    : <div className="sidebar__stat-card">
                        <span className="sidebar__stat-label">Runtime</span>
                        <span
                            className="sidebar__stat-value">{formatRuntime(anime.duration)}</span>
                    </div>
                }
                <ListSection mediaType="anime" media={anime} />
                <div className="sidebar__stat-card">
                    <span className="sidebar__stat-label">Source</span>
                    <span className="sidebar__stat-value">{formatEnumValue(anime.source)}</span>
                </div>
                <div className="sidebar__stat-card">
                    <span className="sidebar__stat-label">Rating</span>
                    <span className="sidebar__stat-value">{formatEnumValue(anime.rating).split(' - ')[0]}</span>
                </div>
                <div className="sidebar__stat-card sidebar__stat-card--release-status">
                    <span className="sidebar__stat-label">Airing Status</span>
                    <span className="sidebar__stat-value">{formatEnumValue(anime.status)}</span>
                    <span
                        className="sidebar__stat-value">{getAiringLabel(anime.status)}: {getAiringDates(anime.status, anime.startDate, anime.endDate)}</span>
                </div>
            </div>
        </>
    );
}
