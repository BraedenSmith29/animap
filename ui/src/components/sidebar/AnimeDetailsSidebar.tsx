import { useMemo } from 'react';
import './DetailsSidebar.css';
import type { Anime } from '@/types';
import { Button } from '@/components/button';
import { useMalIntegration } from '@/context/malIntegration';

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

export function AnimeDetailsSidebar({ anime }: Props) {
    const { isAuthenticated, animangaList, addToList } = useMalIntegration();
    const coverUrl = anime.portraitImage || '';
    const title = anime.title || 'Untitled Anime';
    const subtitle = anime.enTitle || anime.jaTitle || 'No alternate title available';

    const inList = useMemo(() => {
        return animangaList.some((item) => item.id === 'anime' + anime.malId);
    }, [animangaList, anime.malId]);

    const infoChips = [
        formatEnumValue(anime.source),
        formatEnumValue(anime.rating),
        anime.nsfw ? 'NSFW' : null,
    ].filter(
        (chip): chip is string => !!chip && chip !== '-',
    );

    return (
        <>
            <div className="sidebar__image-border">
                {coverUrl ? (
                    <img className="sidebar__image" src={coverUrl} alt={`${title} cover`} />
                ) : (
                    <span className="sidebar__image-fallback">No cover image</span>
                )}
            </div>

            <Button
                variant="secondary"
                size="large"
                className="sidebar__button"
                href={`https://myanimelist.net/anime/${anime.malId}`}
            >
                View on MyAnimeList
            </Button>

            {isAuthenticated() && !inList && (
                <Button
                    variant="primary"
                    size="large"
                    className="sidebar__button"
                    onClick={() => addToList('anime', anime.malId)}
                >
                    Add to List
                </Button>
            )}

            <h2 className="sidebar__title">{title}</h2>
            <p className="sidebar__subtitle">{subtitle}</p>

            <div className="sidebar__stats-grid">
                <div className="sidebar__stat-card">
                    <span className="sidebar__stat-label">Score</span>
                    <span className="sidebar__stat-value">{formatNumber(anime.score)}</span>
                </div>
                <div className="sidebar__stat-card">
                    <span className="sidebar__stat-label">Users</span>
                    <span className="sidebar__stat-value">{formatNumber(anime.members)}</span>
                </div>
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
            </div>

            <div className="sidebar__meta-card">
                <p>{formatMonthYear(anime.startDate)} - {formatMonthYear(anime.endDate)}</p>
                <p>{formatEnumValue(anime.status)}</p>
            </div>

            {infoChips.length > 0 && (
                <div className="sidebar__chips">
                    {infoChips.map((chip) => (
                        <span key={chip} className="sidebar__chip">
                                {chip}
                            </span>
                    ))}
                </div>
            )}

            <p className="sidebar__synopsis">{anime.synopsis || 'No synopsis available.'}</p>

            <dl className="sidebar__details">
            </dl>
        </>
    );
}
