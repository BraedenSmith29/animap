import type { MediaType, SearchResult } from '@/types';

interface Props {
    results: SearchResult[];
    loading: boolean;
    activeIdx: number;
    setActiveIdx: (index: number) => void;
    selectOption: (option: SearchResult) => void;
}

export function SearchBarDropdown({ results, loading, activeIdx, setActiveIdx, selectOption }: Props) {
    const animeResults = results.filter((r) => r.type === 'anime');
    const mangaResults = results.filter((r) => r.type === 'manga');

    const renderSection = (title: string, items: SearchResult[], startIndex: number, type: MediaType) => {
        if (items.length === 0) return null;

        return (
            <>
                <div className={`search__dropdown-header search__dropdown-header--${type}`}>{title}</div>
                {items.map((item, idx) => {
                    const globalIdx = startIndex + idx;
                    return (
                        <div
                            key={`${item.type}-${item.id}`}
                            className={`search__dropdown-item ${globalIdx === activeIdx ? 'search__dropdown-item--active' : ''}`}
                            role="option"
                            aria-selected={globalIdx === activeIdx}
                            onMouseEnter={() => setActiveIdx(globalIdx)}
                            onMouseDown={() => selectOption(item)}
                        >
                            <div className="search__dropdown-item__image">
                                {item.portraitImage ? (
                                    <img src={item.portraitImage} alt={item.title ?? 'Cover image'} />
                                ) : (
                                    <div className="search__dropdown-item__image-fallback" aria-hidden="true">
                                        {item.title?.slice(0, 1)}
                                    </div>
                                )}
                            </div>
                            <div className="search__dropdown-item__info">
                                <div className="search__dropdown-item__name">{item.title}</div>
                                <div className="search__dropdown-item__subtitle">
                                    {item.format}
                                    {item.format && item.year && " - "}
                                    {item.year}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </>
        );
    };

    return (
        <div className="search__dropdown" role="listbox">
            {loading ? (
                <div className="search__dropdown-loading">
                    <div className="search__dropdown-spinner" />
                    Searching...
                </div>
            ) : results.length === 0 ? (
                <div className="search__dropdown-empty">No results found</div>
            ) : (
                <>
                    {renderSection('Anime', animeResults, 0, 'anime')}
                    {renderSection('Manga', mangaResults, animeResults.length, 'manga')}
                </>
            )}
        </div>
    );
}
