import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { MalIntegrationContext } from './MalIntegrationContext';
import type { ListItem, MalListPage } from '@/types/list.ts';
import type { MediaType } from '@/types';

const authenticatedFetch = async (url: string, accessToken: string, signal: AbortSignal) => {
    return fetch(`/api/v1/malProxy?url=${encodeURIComponent(url)}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        signal,
    });
};

const fetchSubList = async (mediaType: MediaType, accessToken: string, signal: AbortSignal) => {
    const newList: ListItem[] = [];

    let nextFetch = `https://api.myanimelist.net/v2/users/@me/${mediaType}list?fields=list_status&limit=1000`;
    while (nextFetch) {
        await authenticatedFetch(nextFetch, accessToken, signal)
            .then(response => response.json())
            .then((data: MalListPage) => {
                newList.push(...data.data.map(entry => ({
                    id: mediaType + entry.node.id,
                    status: entry.list_status.status,
                })));
                nextFetch = data.paging.next ?? '';
            });

        if (signal.aborted) {
            throw new DOMException('Aborted', 'AbortError');
        }
    }

    return newList;
};

const compileFullList = async (accessToken: string, signal: AbortSignal) => {
    const [animeList, mangaList] = await Promise.all([
        fetchSubList('anime', accessToken, signal),
        fetchSubList('manga', accessToken, signal),
    ]);

    return [...animeList, ...mangaList];
};

export function MalIntegrationProvider({ children }: { children: ReactNode }) {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [expiresIn, setExpiresIn] = useState<number | null>(null);
    const [animangaList, setAnimangaList] = useState<ListItem[]>([]);
    const listFetchController = useRef<AbortController | null>(null);

    const isAuthenticated = useCallback(() => {
        return document.cookie.split(';').some(row => row.startsWith('is_logged_in=true'));
    }, []);

    const login = () => {
        window.location.href = '/auth/login';
    };

    const logout = () => {
        window.location.href = '/auth/logout';
    };

    const handleNewAccessToken = (newAccessToken: string, newExpiresIn: number) => {
        if (listFetchController.current) {
            listFetchController.current.abort();
        }

        setAccessToken(newAccessToken);
        setExpiresIn(newExpiresIn);

        listFetchController.current = new AbortController();
        compileFullList(newAccessToken, listFetchController.current.signal)
            .then((newList) => {
                setAnimangaList(newList);
                listFetchController.current = null;
            })
            .catch(error => {
                if (error instanceof DOMException && error.name === 'AbortError') return;
                setAnimangaList([]);
                listFetchController.current = null;
                console.error('Error fetching list:', error);
            });
    };

    const fetchTokenFromCode = useCallback(async (code: string, state: string) => {
        const response = await fetch(`/auth/malTokenFromCode?code=${code}&state=${state}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch token: ${response.statusText}`);
        }
        const data = await response.json();
        handleNewAccessToken(data.access_token, data.expires_in);
    }, []);

    const fetchTokenFromRefresh = useCallback(async () => {
        return fetch('/auth/malRefresh')
            .then(response => response.json())
            .then(data => {
                handleNewAccessToken(data.access_token, data.expires_in);
            });
    }, []);

    useEffect(() => {
        if (isAuthenticated() && !accessToken) {
            fetchTokenFromRefresh()
                .catch(error => console.error('Error fetching token from refresh:', error));
        }
    }, [isAuthenticated, accessToken, fetchTokenFromRefresh]);

    useEffect(() => {
        if (expiresIn !== null) {
            const timeout = setTimeout(() => {
                fetchTokenFromRefresh()
                    .catch(error => console.error('Error fetching token from refresh:', error));
            }, expiresIn);
            return () => clearTimeout(timeout);
        }
    }, [accessToken, expiresIn, fetchTokenFromRefresh]);

    return (
        <MalIntegrationContext.Provider value={{ fetchTokenFromCode, isAuthenticated, login, logout, animangaList }}>
            {children}
        </MalIntegrationContext.Provider>
    );
}
