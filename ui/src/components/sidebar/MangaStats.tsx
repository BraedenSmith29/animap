import './DetailsSidebar.css';
import type { Manga } from '@/types';
import { ListSection } from '@/components/sidebar/ListSection.tsx';

type Props = {
    manga: Manga;
};

export function MangaStats({ manga }: Props) {
    let chapterVolumeLabel;
    let chapterVolumeValue;
    if (manga.chapters && manga.volumes && manga.volumes > 1) {
        chapterVolumeLabel = `Volumes (Chapters)`;
        chapterVolumeValue = `${manga.volumes} (${manga.chapters})`;
    } else if (manga.volumes && manga.volumes > 1) {
        chapterVolumeLabel = `Volumes`;
        chapterVolumeValue = manga.volumes;
    } else {
        chapterVolumeLabel = `Chapters`;
        chapterVolumeValue = manga.chapters ?? 'Unknown';
    }

    const includeEndDate = manga.endDate || ['Publishing', 'On Hiatus', 'Discontinued'].includes(manga.status ?? '');

    return <>
        <div className="sidebar__stat-card">
            <span className="sidebar__stat-label">Type</span>
            <span className="sidebar__stat-value">{manga.mediaType ?? 'Manga'}</span>
        </div>
        <div className="sidebar__stat-card">
            <span className="sidebar__stat-label">{chapterVolumeLabel}</span>
            <span className="sidebar__stat-value">{chapterVolumeValue}</span>
        </div>
        <ListSection mediaType="manga" media={manga} />
        <div className="sidebar__stat-card sidebar__stat-card--release-status">
            <span className="sidebar__stat-label">Airing Status</span>
            <span className="sidebar__stat-value">{manga.status ?? 'Unknown'}</span>
            <span className="sidebar__stat-value">
                Published: {manga.startDate ?? 'Unknown'}{includeEndDate && ` - ${manga.endDate}`}
            </span>
        </div>
    </>;
}
