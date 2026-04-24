import { type ReactNode, useState } from 'react';
import { DEFAULT_FILTER, SearchFilterContext } from '@/context/searchFilter/SearchFilterContext';
import type { FullSearchFilter } from '@/types';

export function SearchFilterProvider({ children }: { children: ReactNode }) {
    const [filter, setFilter] = useState<FullSearchFilter>(DEFAULT_FILTER);

    return (
        <SearchFilterContext.Provider value={{ filter, setFilter }}>
            {children}
        </SearchFilterContext.Provider>
    );
}
