import { Link } from 'react-router';
import './StaticPage.css';

export function TermsOfUse() {
    return (
        <div className="static-page">
            <header className="static-page__header">
                <Link to="/" className="static-page__logo">
                    Ani<span>Map</span>
                </Link>
            </header>
            <main className="static-page__content">
                <h1>Terms of Use</h1>
                <p>Last Updated: April 28, 2026</p>

                <section>
                    <h2>1. Acceptance of Terms</h2>
                    <p>By accessing and using AniMap, you agree to be bound by these Terms of Use and all applicable laws and regulations.</p>
                </section>

                <section>
                    <h2>2. Use License</h2>
                    <p>AniMap is provided for personal, non-commercial use. You may use the visualization tools to explore anime relationships for your own enjoyment.</p>
                </section>

                <section>
                    <h2>3. Disclaimer</h2>
                    <p>The materials on AniMap are provided on an 'as is' basis. AniMap makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
                    <p>Furthermore, AniMap does not warrant or make any representations concerning the accuracy, likely results, or reliability of the materials on its website or otherwise relating to such materials or on any sites linked to this site.</p>
                </section>

                <section>
                    <h2>4. Third-Party Data</h2>
                    <p>AniMap may display data sourced from third-party services such as <a href="https://myanimelist.net/" target="_blank" rel="noopener noreferrer">MyAnimeList</a> or similar platforms. This data is provided for informational purposes only. AniMap makes no guarantees regarding the accuracy, completeness, or availability of third-party data and is not responsible for any errors or omissions originating from those sources. Use of third-party data through AniMap is subject to the respective terms of those platforms.</p>
                </section>

                <section>
                    <h2>5. Limitations</h2>
                    <p>In no event shall AniMap or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use AniMap.</p>
                </section>

                <section>
                    <h2>6. Termination</h2>
                    <p>AniMap reserves the right to terminate or suspend access to the service at any time, without prior notice or liability, for any reason, including if you breach these Terms of Use. Upon termination, your right to use AniMap will immediately cease.</p>
                </section>

                <section>
                    <h2>7. Governing Law</h2>
                    <p>These terms and conditions are governed by and construed in accordance with the laws of the United States and the state in which the creator of AniMap resides. You irrevocably submit to the exclusive jurisdiction of the courts in that state.</p>
                </section>

                <section>
                    <h2>8. Changes to This Policy</h2>
                    <p>We may update our Terms of Use from time to time. Updates to the Terms of Use will be posted on this page.</p>
                </section>
            </main>
        </div>
    );
}
