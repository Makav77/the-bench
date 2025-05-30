// frontend/src/hooks/usePermission.ts
import { useState, useEffect } from "react";
import apiClient from "../../api/apiClient";

export default function usePermission(code: string): { restricted: boolean | null; expiresAt: Date | null } {
    const [state, setState] = useState<{ restricted: boolean | null; expiresAt: Date | null }>({
        restricted: null,
        expiresAt: null,
    });

    useEffect(() => {
        (async () => {
            try {
                const resp = await apiClient.get<{ code: string; restricted: boolean; expiresAt: string | null }>(
                    `/permissions/${code}/isRestricted`
                );
                setState({
                    restricted: resp.data.restricted,
                    expiresAt: resp.data.expiresAt ? new Date(resp.data.expiresAt) : null,
                });
            } catch {
                setState({ restricted: false, expiresAt: null });
            }
        })();
    }, [code]);

    return state;
}
