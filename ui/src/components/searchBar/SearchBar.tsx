import './SearchBar.css';
import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon.tsx';
import { SearchBarDropdown } from '@/components/searchBar/SearchBarDropdown.tsx';
import { useNavigate } from 'react-router';
import type { MalSearchResponse, SearchResult } from '@/types';

function sectionSize(tagetSectionCount: number, otherSectionCount: number) {
    const targetPerSection = 3;
    if (otherSectionCount >= targetPerSection) {
        return Math.min(tagetSectionCount, targetPerSection);
    } else {
        return Math.min(tagetSectionCount, targetPerSection * 2 - otherSectionCount);
    }
}

export function SearchBar() {
    const navigate = useNavigate();
    const wrapperRef = useRef<HTMLDivElement>(null);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);

    useEffect(() => {
        const q = query.trim().toLowerCase();
        if (!q) {
            setResults([]);
            setOpen(false);
            setLoading(false);
            setActiveIdx(-1);
            return;
        }

        const abortController = new AbortController();
        setLoading(true);

        const timeoutId = setTimeout(async () => {
            try {
                const newSearch: MalSearchResponse = await fetch(`/api/v1/malProxy?url=${encodeURIComponent(`https://myanimelist.net/search/prefix.json?type=all&keyword=${encodeURIComponent(q)}`)}`)
                    .then(response => response.json());

                const allAnimeResults = newSearch.categories.find((result) => result.type === 'anime')?.items ?? [];
                const allMangaResults = newSearch.categories.find((result) => result.type === 'manga')?.items ?? [];

                const animeResults: SearchResult[] = allAnimeResults
                    .slice(0, sectionSize(allAnimeResults.length, allMangaResults.length))
                    .map((item): SearchResult => ({
                        id: item.id,
                        title: item.name,
                        portraitImage: item.image_url ?? null,
                        format: item.payload?.media_type ?? null,
                        year: item.payload?.start_year ?? null,
                        type: 'anime',
                    }));
                const mangaResults: SearchResult[] = allMangaResults
                    .slice(0, sectionSize(allMangaResults.length, allAnimeResults.length))
                    .map((item): SearchResult => ({
                        id: item.id,
                        title: item.name,
                        portraitImage: item.image_url ?? null,
                        format: item.payload?.media_type ?? null,
                        year: item.payload?.start_year ?? null,
                        type: 'manga',
                    }));

                const combinedResults = [...animeResults, ...mangaResults];
                setResults(combinedResults);
                setOpen(true);
                setLoading(false);
                setActiveIdx(combinedResults.length > 0 ? 0 : -1);
            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') return;
                console.error('Failed to fetch search results:', error);
                setResults([]);
                setLoading(false);
            }
        }, 300);

        return () => {
            abortController.abort();
            clearTimeout(timeoutId);
        };
    }, [query]);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const selectOption = (option: SearchResult) => {
        navigate(`/${option.type}/${option.id}`);
        setOpen(false);
        setQuery('');
        setResults([]);
        setActiveIdx(-1);
    };

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (!open) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIdx(i => Math.min(i + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIdx(i => Math.max(i - 1, 0));
        } else if (e.key === 'Escape') {
            setOpen(false);
        } else if (e.key === 'Enter' && activeIdx >= 0 && results.length > activeIdx) {
            const selected = results[activeIdx];
            selectOption(selected);
        }
    }

    return <div className="search__wrapper" ref={wrapperRef}>
        <div className="search__input-row">
            <Icon type="search" className="search__icon" />
            <input
                className="search__input"
                type="text"
                placeholder="Search anime or manga…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown}
                aria-label="Search anime or manga"
                autoComplete="off"
                spellCheck={false}
            />
            {query && (
                <button
                    className="search__clear"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                >
                    <Icon type="close" />
                </button>
            )}
        </div>
        {open && query &&
            <SearchBarDropdown
                results={results}
                loading={loading}
                activeIdx={activeIdx}
                setActiveIdx={setActiveIdx}
                selectOption={selectOption}
            />
        }
    </div>;
}
