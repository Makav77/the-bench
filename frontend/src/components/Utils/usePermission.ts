import { useState, useEffect } from "react";
import { isRestricted } from "../../api/permissionsService";

function usePermission(code: string) {
    const [restricted, setRestricted] = useState<boolean | null>(null);
    useEffect(() => {
        let mounted = true;
        isRestricted(code).then(r => {
            if (mounted) setRestricted(r);
        }).catch(() => {
            if (mounted) setRestricted(false);
        });
        return () => { mounted = false };
    }, [code]);
    return restricted;
}

export default usePermission;
