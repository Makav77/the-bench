import { useState, FormEvent, useEffect } from "react";
import { restrictUser, DEFAULT_PERMISSIONS } from "../../api/permissionsService";
import { toast } from "react-toastify";
import apiClient from "../../api/apiClient";
import { useTranslation } from "react-i18next";




function DashboardRestrictions() {
    const { t } = useTranslation("Dashboard/DashboardRestrictions");
    const [userId, setUserId] = useState<string>("");
    const [reason, setReason] = useState<string>("");
    const [days, setDays] = useState<number>(0);
    const [hours, setHours] = useState<number>(0);
    const [minutes, setMinutes] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [query, setQuery] = useState<string>("");
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [results, setResults] = useState<{ id: string; firstname: string; lastname: string; }[]>([]);
    const [selectedPermission, setSelectedPermission] = useState<string>(
        DEFAULT_PERMISSIONS[0].code
    );

    useEffect(() => {
        const refreshUsers = async () => {
            if (query.length >= 2) {
                setIsSearching(true);
                try {
                    const response = await apiClient.get(`/users/search?query=${encodeURIComponent(query)}`);
                    setResults(response.data);
                } catch (error) {
                    console.error("Error while searching users : ", error);
                    setResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults([]);
                setIsSearching(false);
            }
        };
        const delayDebounceFn = setTimeout(() => {
            refreshUsers();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!userId.trim() || !reason.trim()) {
            toast.error(t("toastEmptyUserOrReason"));
            return;
        }

        setIsSubmitting(true);
        try {
            await restrictUser(
                selectedPermission,
                reason,
                userId,
                days,
                hours,
                minutes
            );
            toast.success(t("toastUserRestricted"));
            setUserId("");
            setReason("");
            setDays(0);
            setHours(0);
            setMinutes(0);
            setSelectedPermission(DEFAULT_PERMISSIONS[0].code);
        } catch (error) {
            console.error(error);
            toast.error(t("toastUserRestricted"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">
                {t("addRestriction")}
            </h2>

            <form
                onSubmit={handleSubmit}
                className="space-y-4 bg-white p-6 rounded shadow"
            >
                <div>
                    <label className="block font-semibold mb-1">
                        {t("restrictionChoice")}
                    </label>
                    <select
                        name="permissionCode"
                        value={selectedPermission}
                        onChange={(e) =>
                            setSelectedPermission(e.target.value)
                        }
                        className="w-full border rounded px-2 py-1"
                    >
                        {DEFAULT_PERMISSIONS.map((opt) => (
                            <option key={opt.code} value={opt.code}>
                                {opt.description} ({opt.code})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block font-semibold mb-1">
                        {t("userToRestrict")} <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="userSearch"
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full border rounded px-2 py-1"
                        placeholder={t("userToRestrictPlaceholder")}
                    />

                    {query.length >= 2 && (
                        <div className="border border-gray-300 rounded mt-1 bg-white shadow max-h-40 overflow-y-auto">
                            {isSearching ? (
                                <div className="px-2 py-1 text-gray-500 italic">{t("reason")}</div>
                            ) : results.length > 0 ? (
                                results.map((user) => (
                                    <div
                                        key={user.id}
                                        onClick={() => {
                                            setUserId(user.id);
                                            setQuery(`${user.firstname} ${user.lastname}`);
                                            setResults([]);
                                        }}
                                        className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                    >
                                        {user.firstname} {user.lastname} ({user.id})
                                    </div>
                                ))
                            ) : (
                                <div className="px-2 py-1 text-gray-500 italic">{t("noUserFound")}</div>
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block font-semibold mb-1">
                        {t("reason")}
                        <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="reason"
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full border rounded px-2 py-1"
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block font-semibold mb-1">
                            {t("days")}
                        </label>
                        <input
                            name="days"
                            type="number"
                            min={0}
                            value={days}
                            onChange={(e) =>
                                setDays(parseInt(e.target.value, 10) || 0)
                            }
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">
                            {t("hours")}
                        </label>
                        <input
                            name="hours"
                            type="number"
                            min={0}
                            max={23}
                            value={hours}
                            onChange={(e) =>
                                setHours(parseInt(e.target.value, 10) || 0)
                            }
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">
                            {t("minutes")}
                        </label>
                        <input
                            name="minutes"
                            type="number"
                            min={0}
                            max={59}
                            value={minutes}
                            onChange={(e) =>
                                setMinutes(parseInt(e.target.value, 10) || 0)
                            }
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
                    >
                        {isSubmitting ? t("inProgress") : t("restrict")}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default DashboardRestrictions;
