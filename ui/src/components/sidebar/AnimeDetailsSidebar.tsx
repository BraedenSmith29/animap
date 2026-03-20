import './AnimeDetailsSidebar.css';
import type { Anime } from '../../types/graph.ts';
import { Icon } from '../Icon.tsx';

type Props = {
    anime: Anime;
    isClosing: boolean;
    onClose: () => void;
    onClosed: () => void;
};

const formatEnumValue = (value?: string) => {
    if (!value) {
        return '-';
    }

    return value
        .replaceAll('_', ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const formatMonthYear = (value?: string) => {
    if (!value) {
        return '-';
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(parsedDate);
};

const formatNumber = (value?: number) => (typeof value === 'number' ? value.toLocaleString() : '-');
const formatNumericValue = (value?: number) => (typeof value === 'number' && !Number.isNaN(value) ? value : '-');
const formatRuntime = (seconds?: number) => {
    if (typeof seconds !== 'number' || Number.isNaN(seconds)) {
        return 'Unknown';
    }

    const totalMinutes = seconds / 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h`;
    } else if (minutes > 0) {
        return `${minutes}m`;
    } else {
        return 'N/A'
    }
}

export function AnimeDetailsSidebar({ anime, isClosing, onClose, onClosed }: Props) {
    const coverUrl = anime.mainPicture?.large || '';
    const title = anime.title || 'Untitled anime';
    const subtitle = anime.enTitle || anime.jaTitle || 'No alternate title available';

    const infoChips = [formatEnumValue(anime.source), formatEnumValue(anime.rating), formatEnumValue(anime.nsfw)].filter(
        (chip) => chip !== '-',
    );

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
                <button type="button" className="sidebar__button" onClick={onClose} aria-label="Close sidebar">
                    <Icon type="close" />
                </button>
                <p className="sidebar__heading">Details</p>
                <button type="button" className="sidebar__button" aria-label="Options">
                    <Icon type="dots-three" />
                </button>
            </div>

            <div className="sidebar__content">
                <div className="sidebar__image-border">
                    {coverUrl ? (
                        <img className="sidebar__image" src={coverUrl} alt={`${title} cover`} />
                    ) : (
                        <span className="sidebar__image-fallback">No cover image</span>
                    )}
                </div>

                <a
                    className="sidebar__mal-link"
                    href={`https://myanimelist.net/anime/${anime.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View on MyAnimeList
                </a>

                <h2 className="sidebar__title">{title}</h2>
                <p className="sidebar__subtitle">{subtitle}</p>

                <div className="sidebar__stats-grid">
                    <div className="sidebar__stat-card">
                        <span className="sidebar__stat-label">Score</span>
                        <span className="sidebar__stat-value">{formatNumericValue(anime.meanScore)}</span>
                    </div>
                    <div className="sidebar__stat-card">
                        <span className="sidebar__stat-label">Users</span>
                        <span className="sidebar__stat-value">{formatNumber(anime.numListUsers)}</span>
                    </div>
                    <div className="sidebar__stat-card">
                        <span className="sidebar__stat-label">Type</span>
                        <span className="sidebar__stat-value">{formatEnumValue(anime.mediaType)}</span>
                    </div>
                    {anime.numEpisodes > 1 ?
                        <div className="sidebar__stat-card">
                            <span className="sidebar__stat-label">Episodes</span>
                            <span className="sidebar__stat-value">{formatNumericValue(anime.numEpisodes)}</span>
                        </div>
                        : <div className="sidebar__stat-card">
                            <span className="sidebar__stat-label">Runtime</span>
                            <span
                                className="sidebar__stat-value">{formatRuntime(anime.averageEpisodeDuration)}</span>
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
            </div>
        </aside>
    );
}
