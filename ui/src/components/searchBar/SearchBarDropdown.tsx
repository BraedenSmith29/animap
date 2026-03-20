interface Props {
    results: { id: number; title: string }[];
    activeIdx: number;
    setActiveIdx: (index: number) => void;
    selectOption: (animeId: number) => void;
}

export function SearchBarDropdown({ results, activeIdx, setActiveIdx, selectOption }: Props) {
    return <div className="search__dropdown" role="listbox">
        {results.length === 0 ? (
            <div className="search__dropdown-empty">No results found</div>
        ) : (
            results.map((anime, idx) => (
                <div
                    key={anime.id}
                    className={`search__dropdown-item ${idx === activeIdx ? 'search__dropdown-item--active' : ''}`}
                    role="option"
                    aria-selected={idx === activeIdx}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onMouseDown={() => selectOption(anime.id)}
                >
                    <div className="search__dropdown-item__icon"></div>
                    <span className="search__dropdown-item__name">{anime.title}</span>
                </div>
            ))
        )}
    </div>;
}