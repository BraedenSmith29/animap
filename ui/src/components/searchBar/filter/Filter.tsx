import './Filter.css';
import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { Button } from '@/components/button';
import type { AnimeSearchType, FullSearchFilter, MangaSearchType, SearchFilter } from '@/types';
import { useClickOutside } from '@/hooks';
import { DEFAULT_FILTER } from '@/context/searchFilter';
import { FilterCheckboxSection } from '@/components/searchBar/filter/FilterCheckboxSection.tsx';

const CATEGORIES: SearchFilter[] = ['all', 'anime', 'manga'];
const ANIME_MEDIA_TYPES: AnimeSearchType[] = ['TV', 'OVA', 'Movie', 'Special', 'ONA', 'Music', 'CM', 'PV', 'TV Special'];
const MANGA_MEDIA_TYPES: MangaSearchType[] = ['Manga', 'Novel', 'Light Novel', 'One-shot', 'Doujinshi', 'Manhua', 'Manhwa'];

interface FilterProps {
    filter: FullSearchFilter;
    onFilterSave: (filter: FullSearchFilter, applyNow: boolean) => void;
    onClose?: () => void;
    onGraphPage: boolean;
}

export function Filter({ filter, onFilterSave, onClose, onGraphPage }: FilterProps) {
    const [filterOpen, setFilterOpen] = useState(false);
    const [localFilter, setLocalFilter] = useState<FullSearchFilter>(filter);

    const filterRef = useClickOutside<HTMLDivElement>(useCallback(() => setFilterOpen(false), []));

    useEffect(() => {
        setLocalFilter(filter);
    }, [filter]);

    const hasError = ANIME_MEDIA_TYPES.every(t => localFilter.excludedMediaTypes.includes(t)) ||
        MANGA_MEDIA_TYPES.every(t => localFilter.excludedMediaTypes.includes(t));

    return (
        <div className="filter__type-selector" ref={filterRef}>
            <button
                className={`filter__type-trigger ${filterOpen ? 'filter__type-trigger--active' : ''}`}
                onClick={() => {
                    if (filterOpen) {
                        setFilterOpen(false);
                        if (onClose) onClose();
                    } else {
                        setLocalFilter(filter);
                        setFilterOpen(true);
                    }
                }}
                aria-haspopup="listbox"
                aria-expanded={filterOpen}
            >
                Filters
                <Icon type="chevron-down"
                      className={`filter__type-icon ${filterOpen ? 'filter__type-icon--rotated' : ''}`} />
            </button>
            {filterOpen && (
                <div className="filter__filter-popup" role="dialog" aria-label="Search filters">
                    <div className="filter__filter-section">
                        <div className="filter__filter-label">Category</div>
                        <div className="filter__filter-options">
                            {CATEGORIES.map((category) => (
                                <Button
                                    key={category}
                                    variant={localFilter.category === category ? 'primary' : 'secondary'}
                                    size="medium"
                                    className="filter__filter-btn"
                                    onClick={() => setLocalFilter(prev => ({ ...prev, category: category }))}
                                >
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {localFilter.category !== 'manga' && (
                        <FilterCheckboxSection
                            entries={ANIME_MEDIA_TYPES}
                            label="Anime Types"
                            localFilter={localFilter}
                            setLocalFilter={setLocalFilter}
                        />
                    )}
                    {localFilter.category !== 'anime' && (
                        <FilterCheckboxSection
                            entries={MANGA_MEDIA_TYPES}
                            label="Manga Types"
                            localFilter={localFilter}
                            setLocalFilter={setLocalFilter}
                        />
                    )}

                    <div className="filter__filter-actions">
                        <Button
                            variant="secondary"
                            size="medium"
                            className="filter__filter-action-btn"
                            onClick={() => setLocalFilter(DEFAULT_FILTER)}
                        >
                            Reset Filters
                        </Button>
                        <Button
                            variant="primary"
                            size="medium"
                            className="filter__filter-action-btn"
                            disabled={hasError}
                            onClick={() => {
                                onFilterSave(localFilter, !onGraphPage);
                                setFilterOpen(false);
                                if (onClose) onClose();
                            }}
                        >
                            Save Filters
                        </Button>
                        {onGraphPage && (
                            <Button
                                variant="secondary"
                                size="medium"
                                className="filter__filter-action-btn--full"
                                disabled={hasError}
                                onClick={() => {
                                    onFilterSave(localFilter, true);
                                    setFilterOpen(false);
                                }}
                            >
                                Save and Apply to Graph
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
