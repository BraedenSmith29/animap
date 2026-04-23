import type { FullSearchFilter, MediaTypeFilter } from '@/types';
import type { SetStateAction } from 'react';

interface Props {
    entries: MediaTypeFilter[];
    label: string;
    localFilter: FullSearchFilter;
    setLocalFilter: (filter: SetStateAction<FullSearchFilter>) => void;
}

export function FilterCheckboxSection({ entries, label, localFilter, setLocalFilter }: Props) {
    const allUnchecked = entries.every(entry => localFilter.excludedMediaTypes.includes(entry));

    return (
        <div className="filter__filter-section">
            <div className="filter__filter-label">{label}</div>
            <div className="filter__filter-grid">
                {entries.map((entry) => (
                    <label key={entry} className="filter__filter-checkbox">
                        <input
                            type="checkbox"
                            checked={!localFilter.excludedMediaTypes.includes(entry)}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setLocalFilter(prev => ({
                                    ...prev,
                                    excludedMediaTypes: !checked
                                        ? [...prev.excludedMediaTypes, entry]
                                        : prev.excludedMediaTypes.filter(t => t !== entry)
                                }));
                            }}
                        />
                        <span>{entry}</span>
                    </label>
                ))}
            </div>
            {allUnchecked && (
                <div className="filter__filter-error">
                    At least one type must be selected. If you want to exclude the whole category, select the other on at the top.
                </div>
            )}
        </div>
    )
}
