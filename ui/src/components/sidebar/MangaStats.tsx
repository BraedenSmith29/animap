import './DetailsSidebar.css';
import type { Manga } from '@/types';
import { ListSection } from '@/components/sidebar/ListSection.tsx';

type Props = {
    manga: Manga;
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

const formatNumericValue = (value?: number | null) => (typeof value === 'number' && !Number.isNaN(value) ? value : '-');

const getPublishingLabel = (publishingStatus: string | null) => {
    if (publishingStatus === 'Finished') {
        return 'Published';
    } else if (publishingStatus === 'Publishing') {
        return 'Publishing';
    } else if (publishingStatus === 'On Hiatus') {
        return 'Publishing';
    } else if (publishingStatus === 'Discontinued') {
        return 'Published';
    } else if (publishingStatus === 'Not yet published') {
        return 'Publishing';
    }
};

const getPublishingDates = (publishingStatus: string | null, startDate: string | null, endDate: string | null) => {
    const start = startDate ?? 'Unknown';
    let end = endDate;

    if (end == null && (publishingStatus === 'Publishing' || publishingStatus === 'On Hiatus' || publishingStatus === 'Discontinued')) {
        end = 'Unknown';
    }

    if (end) {
        return `${formatMonthYear(start)} - ${formatMonthYear(end)}`;
    } else {
        return formatMonthYear(start);
    }
};

export function MangaStats({ manga }: Props) {
    return (
        <>
            <div className="sidebar__stats-grid">
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
                <ListSection mediaType="manga" media={manga} />
                <div className="sidebar__stat-card sidebar__stat-card--release-status">
                    <span className="sidebar__stat-label">Airing Status</span>
                    <span className="sidebar__stat-value">{formatEnumValue(manga.status)}</span>
                    <span
                        className="sidebar__stat-value">{getPublishingLabel(manga.status)}: {getPublishingDates(manga.status, manga.startDate, manga.endDate)}</span>
                </div>
            </div>
        </>
    );
}
