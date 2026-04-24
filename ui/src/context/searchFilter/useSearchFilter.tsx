import { useContext } from 'react';
import { SearchFilterContext } from '@/context/searchFilter/SearchFilterContext';

export function useSearchFilter() {
    const context = useContext(SearchFilterContext);
    if (context === undefined) {
        throw new Error('useSearchFilter must be used within a SearchFilterProvider');
    }
    return context;
}
