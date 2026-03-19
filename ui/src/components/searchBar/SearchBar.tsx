import './SearchBar.css';
import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "../Icon.tsx";
import { useNavigate } from "react-router";
import { SearchBarDropdown } from "./SearchBarDropdown.tsx";

const MOCK_ANIME: { id: number; title: string; }[] = [
    { id: 121, title: 'Fullmetal Alchemist (2003)' },
    { id: 5114, title: 'Fullmetal Alchemist: Brotherhood' },
    { id: 9253, title: 'Steins;Gate' },
    { id: 22297, title: 'Fate/stay night: Unlimited Blade Works' },
    { id: 31240, title: 'Re:Zero kara Hajimeru Isekai Seikatsu' },
    { id: 52991, title: 'Sousou no Frieren' },
];

const MAX_RESULTS = 6;

export function SearchBar() {
    const navigate = useNavigate();
    const wrapperRef = useRef<HTMLDivElement>(null);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<typeof MOCK_ANIME>([]);
    const [open, setOpen] = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);

    const onInputChange = useCallback((newValue: string) => {
        setQuery(newValue);
        const q = newValue.trim().toLowerCase();
        if (!q) {
            setResults([]);
            setOpen(false);
            setActiveIdx(-1);
            return;
        }
        const filtered = MOCK_ANIME
            .filter(a => a.title.toLowerCase().includes(q))
            .slice(0, MAX_RESULTS);
        setResults(filtered);
        setOpen(true);
        setActiveIdx(0);
    }, []);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

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
            navigate(`/${results[activeIdx].id}`);
            setOpen(false);
        }
    }

    return <div className="search__wrapper" ref={wrapperRef}>
        <div className="search__input-row">
            <Icon type="search" className="search__icon" />
            <input
                className="search__input"
                type="text"
                placeholder="Search anime…"
                value={query}
                onChange={e => onInputChange(e.target.value)}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown}
                aria-label="Search anime"
                autoComplete="off"
                spellCheck={false}
            />
            {query && (
                <button
                    className="search__clear"
                    onClick={() => onInputChange('')}
                    aria-label="Clear search"
                >
                    <Icon type="close" />
                </button>
            )}
        </div>
        {open && <SearchBarDropdown results={results} activeIdx={activeIdx} setActiveIdx={setActiveIdx} />}
    </div>;
}