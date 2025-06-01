import { useState, useEffect } from "react";
import { isRestricted, IsRestrictedResponse } from "../../api/permissionsService";

export default function usePermission(code: string) {
    const [restricted, setRestricted] = useState<boolean>(false);
    const [expiresAt, setExpiresAt] = useState<string | null>(null);
    const [reason, setReason] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        (async () => {
            try {
                const response: IsRestrictedResponse = await isRestricted(code);
                setRestricted(response.restricted);
                setExpiresAt(response.expiresAt);
                setReason(response.reason);
            } catch (error) {
                console.error("Erreur usePermission :", error);
            } finally {
                setLoading(false);
            }
        })();
    }, [code]);

    return { restricted, expiresAt, reason, loading };
}
