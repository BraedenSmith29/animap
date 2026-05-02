import { type ReactNode, useState } from 'react';
import { DEFAULT_FILTER, SearchFilterContext } from '@/context/searchFilter/SearchFilterContext';
import type { FullSearchFilter } from '@/types';

export function SearchFilterProvider({ children }: { children: ReactNode }) {
    const savedFilter = localStorage.getItem('searchFilter');
    const [filter, setFilter] = useState<FullSearchFilter>(savedFilter ? JSON.parse(savedFilter) : DEFAULT_FILTER);

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
