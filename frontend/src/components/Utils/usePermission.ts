import { useState, useEffect } from "react";
import { isRestricted } from "../../api/permissionsService";

export default function usePermission(code: string) {
    const [restricted, setRestricted] = useState<boolean>(false);
    const [expiresAt, setExpiresAt] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        (async () => {
            try {
                const response = await isRestricted(code);
                setRestricted(response);
                setExpiresAt(null);
            } catch (error) {
                console.error("Erreur usePermission :", error);
            } finally {
                setLoading(false);
            }
        })();
    }, [code]);

    return { restricted, expiresAt, loading };
}
