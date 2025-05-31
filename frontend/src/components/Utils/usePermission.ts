import { useState, useEffect } from "react";
import apiClient from "../../api/apiClient";

export interface PermissionStatus {
    restricted: boolean;
    expiresAt?: string;
}

export default function usePermission(code: string) {
    const [status, setStatus] = useState<PermissionStatus>({ restricted: false });
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        let cancelled = false;
        apiClient
            .get<PermissionStatus>(`/permissions/${code}/isRestricted`)
            .then(res => {
                if (!cancelled) setStatus(res.data);
            })
            .catch(() => {
                if (!cancelled) setStatus({ restricted: false });
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [code]);

    return { ...status, loading };
}
