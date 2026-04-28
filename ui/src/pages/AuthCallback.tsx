import './AuthCallback.css';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useMalIntegration } from '@/context/malIntegration';
import { Button } from '@/components/button/Button';

export function AuthCallback() {
    const navigate = useNavigate();
    const location = useLocation();
    const { fetchTokenFromCode } = useMalIntegration();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const code = query.get('code');
        const state = query.get('state');

        if (code && state) {
            fetchTokenFromCode(code, state)
                .then(() => navigate('/', { replace: true }))
                .catch(err => {
                    console.error('Login failed:', err);
                    setError('Failed to complete login. Please try again.');
                });
        } else {
            setError('Invalid login response from MyAnimeList.');
        }
    }, [fetchTokenFromCode, location, navigate]);

    if (error) {
        return (
            <div className="loading__overlay auth-callback">
                <div className="auth-callback__error-title">
                    Error
                </div>
                <p className="auth-callback__error-message">{error}</p>
                <Link to="/"><Button>Go back Home</Button></Link>
            </div>
        );
    }

    return (
        <div className="loading__overlay auth-callback">
            <div className="loading__spinner" />
            <p className="auth-callback__loading-message">Logging you in... redirecting shortly</p>
        </div>
    );
}
