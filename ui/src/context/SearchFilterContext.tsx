import { createContext, useContext, useState, type ReactNode } from 'react';
import type { FullSearchFilter } from '@/types';

interface SearchFilterContextType {
    filter: FullSearchFilter;
    setFilter: (filter: FullSearchFilter) => void;
}

export const DEFAULT_FILTER: FullSearchFilter = {
    category: 'all',
    excludedMediaTypes: [],
};

const SearchFilterContext = createContext<SearchFilterContextType | undefined>(undefined);

export function SearchFilterProvider({ children }: { children: ReactNode }) {
    const [filter, setFilter] = useState<FullSearchFilter>(DEFAULT_FILTER);

    return (
        <SearchFilterContext.Provider value={{ filter, setFilter }}>
            {children}
        </SearchFilterContext.Provider>
    );
}

export function useSearchFilter() {
    const context = useContext(SearchFilterContext);
    if (context === undefined) {
        throw new Error('useSearchFilter must be used within a SearchFilterProvider');
    }
    return context;
}
