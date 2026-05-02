import { type ReactNode, useState } from 'react';
import { DEFAULT_FILTER, SearchFilterContext } from '@/context/searchFilter/SearchFilterContext';
import type { FullSearchFilter } from '@/types';

export function SearchFilterProvider({ children }: { children: ReactNode }) {
    const getInitialFilter = (): FullSearchFilter => {
        try {
            const saved = localStorage.getItem('searchFilter');
            if (saved) {
                return { ...DEFAULT_FILTER, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error('Failed to parse search filter from localStorage', e);
        }
        return DEFAULT_FILTER;
    };

    const [filter, setFilter] = useState<FullSearchFilter>(getInitialFilter());

    const handleSetFilter = (newFilter: FullSearchFilter) => {
        localStorage.setItem('searchFilter', JSON.stringify(newFilter));
        setFilter(newFilter);
    };

    return (
        <SearchFilterContext.Provider value={{ filter, setFilter: handleSetFilter }}>
            {children}
        </SearchFilterContext.Provider>
    );
}
