import { Link } from 'react-router';
import './StaticPage.css';

export function PrivacyPolicy() {
    return (
        <div className="static-page">
            <header className="static-page__header">
                <Link to="/" className="static-page__logo">
                    Ani<span>Map</span>
                </Link>
            </header>
            <main className="static-page__content">
                <h1>Privacy Policy</h1>
                <p>Last Updated: April 28, 2026</p>
                
                <section>
                    <h2>1. Information We Collect</h2>
                    <p>AniMap collects absolutely zero information about its users.</p>
                    <p>When you log in with <a href="https://myanimelist.net/" target="_blank" rel="noopener noreferrer">MyAnimeList</a>, we access your public profile and anime list data to provide the integration features. We do not store this data on our servers; it is processed locally in your browser.</p>
                </section>

                <section>
                    <h2>2. How We Use Your Information</h2>
                    <p>The information accessed from MyAnimeList is used solely to display your progress and status on the anime relationship graphs within the application.</p>
                </section>

                <section>
                    <h2>3. Cookies</h2>
                    <p>We use essential cookies and browser local storage to maintain your authentication state with MyAnimeList. This ensures we do not need to store any information on our servers.</p>
                </section>

                <section>
                    <h2>4. Third-Party Services</h2>
                    <p>AniMap uses the <a href="https://jikan.moe/" target="_blank" rel="noopener noreferrer">Jikan API</a> (an unofficial MyAnimeList API) to fetch anime data. Your data is never sent to Jikan.</p>
                    <p>Your use of AniMap is also subject to MyAnimeList's privacy policy when using the integration features.</p>
                </section>

                <section>
                    <h2>5. Changes to This Policy</h2>
                    <p>We may update our Privacy Policy from time to time. Updates to the Privacy Policy will be posted on this page.</p>
                </section>
            </main>
        </div>
    );
}
