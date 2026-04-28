import './Home.css';
import { Icon, SearchBar, Button } from '@/components';
import { useMalIntegration } from '@/context/malIntegration';
import { Link } from 'react-router';

export function Home() {
    const { isAuthenticated, login, logout } = useMalIntegration();

    return (
        <div className="home">
            <h1 className="home__title">Ani<span>Map</span></h1>
            <p className="home__subtitle">Visualize anime series, watch order, and spin-off relationships.</p>
            <SearchBar />
            <div className="home__auth">
                {isAuthenticated() ? (
                    <Button variant="secondary" onClick={logout}>Disconnect MyAnimeList</Button>
                ) : (
                    <Button variant="primary" onClick={login}>Log in with MyAnimeList</Button>
                )}
            </div>
            <div className="home__footer-left">
                <a
                    className="home__footer-link"
                    href="https://myanimelist.net"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Data from MyAnimeList
                </a>
                <Link className="home__footer-link" to="/privacy">Privacy Policy</Link>
                <Link className="home__footer-link" to="/terms">Terms of Use</Link>
            </div>
            <div className="home__footer-right">
                <a
                    className="home__footer-link"
                    href="https://github.com/braedensmith29/animap"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View on GitHub"
                >
                    <Icon type="github" />
                    GitHub
                </a>
            </div>
        </div>
    );
}
