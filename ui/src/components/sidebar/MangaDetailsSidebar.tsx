import './DetailsSidebar.css';
import type { Manga } from '@/types';
import { Icon } from '@/components';

type Props = {
    manga: Manga;
    isClosing: boolean;
    onClose: () => void;
    onClosed: () => void;
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

const formatMonthYear = (value?: string | null) => {
    if (!value) {
        return '-';
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(parsedDate);
};

const formatNumber = (value?: number | null) => (typeof value === 'number' ? value.toLocaleString() : '-');
const formatNumericValue = (value?: number | null) => (typeof value === 'number' && !Number.isNaN(value) ? value : '-');

export function MangaDetailsSidebar({ manga, isClosing, onClose, onClosed }: Props) {
    const coverUrl = manga.portraitImage || '';
    const title = manga.title || 'Untitled Manga';
    const subtitle = manga.enTitle || manga.jaTitle || 'No alternate title available';

    const infoChips = [
        manga.nsfw ? 'NSFW' : null,
    ].filter(
        (chip): chip is string => !!chip,
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
                    href={`https://myanimelist.net/manga/${manga.malId}`}
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
                        <span className="sidebar__stat-value">{formatNumericValue(manga.score)}</span>
                    </div>
                    <div className="sidebar__stat-card">
                        <span className="sidebar__stat-label">Users</span>
                        <span className="sidebar__stat-value">{formatNumber(manga.members)}</span>
                    </div>
                    <div className="sidebar__stat-card">
                        <span className="sidebar__stat-label">Type</span>
                        <span className="sidebar__stat-value">{formatEnumValue(manga.mediaType)}</span>
                    </div>
                    {manga.volumes && manga.volumes > 1 ?
                        <div className="sidebar__stat-card">
                            <span className="sidebar__stat-label">Volumes</span>
                            <span className="sidebar__stat-value">{formatNumericValue(manga.volumes)}</span>
                        </div>
                        : <div className="sidebar__stat-card">
                            <span className="sidebar__stat-label">Chapters</span>
                            <span className="sidebar__stat-value">{formatNumericValue(manga.chapters)}</span>
                        </div>
                    }
                </div>

                <div className="sidebar__meta-card">
                    <p>{formatMonthYear(manga.startDate)} - {formatMonthYear(manga.endDate)}</p>
                    <p>{formatEnumValue(manga.status)}</p>
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

                <p className="sidebar__synopsis">{manga.synopsis || 'No synopsis available.'}</p>

                <dl className="sidebar__details">
                </dl>
            </div>
        </aside>
    );
}
