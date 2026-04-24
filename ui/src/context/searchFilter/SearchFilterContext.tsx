import { createContext } from 'react';
import type { FullSearchFilter } from '@/types';

interface SearchFilterContextType {
    filter: FullSearchFilter;
    setFilter: (filter: FullSearchFilter) => void;
}

export const DEFAULT_FILTER: FullSearchFilter = {
    category: 'all',
    excludedMediaTypes: [],
};

export const SearchFilterContext = createContext<SearchFilterContextType | undefined>(undefined);
