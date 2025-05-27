import { useState, useEffect } from "react";

function useDailyCache<T>(key: string, fetcher: () => Promise<T>): {
    data: T | null;
    loading: boolean;
    error: any;
} {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            const stored = localStorage.getItem(key);
            if (stored) {
                try {
                    const { timestamp, payload } = JSON.parse(stored) as {
                        timestamp: number;
                        payload: T;
                    };
                    const oneDay = 24 * 60 * 60 * 1000;
                    if (Date.now() - timestamp < oneDay) {
                        setData(payload);
                        setLoading(false);
                        return;
                    }
                } catch (error) {
                    console.error("Invalid cache, refetching", error);
                }
            }

            try {
                const result = await fetcher();
                if (!cancelled) {
                    setData(result);
                    localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), payload: result }));
                }
            } catch (error) {
                if (!cancelled) {
                    setError(error);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, [key, fetcher]);

    return { data, loading, error };
}

export default useDailyCache;
