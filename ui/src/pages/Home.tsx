import './Home.css';
import { Icon } from "../components/Icon.tsx";
import { SearchBar } from "../components/searchBar/SearchBar.tsx";


export function Home() {

    return (
        <div className="home">
            <h1 className="home__title">Ani<span>Map</span></h1>
            <p className="home__subtitle">Visualize anime series, watch order, and spin-off relationships.</p>
            <SearchBar />
            <a
                className="home__mal"
                href="https://myanimelist.net"
                target="_blank"
                rel="noopener noreferrer"
            >
                Data from MyAnimeList
            </a>
            <a
                className="home__github"
                href="https://github.com/braedensmith29/animap"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View on GitHub"
            >
                <Icon type="github" />
                GitHub
            </a>
        </div>
    );
}