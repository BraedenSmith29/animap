import { createContext } from 'react';
import type { FullSearchFilter } from '@/types';

interface SearchFilterContextType {
    filter: FullSearchFilter;
    setFilter: (filter: FullSearchFilter) => void;
}

export const DEFAULT_FILTER: FullSearchFilter = {
    category: 'all',
    excludedMediaTypes: [],
    hideNSFW: false,
};

export const SearchFilterContext = createContext<SearchFilterContextType | undefined>(undefined);
