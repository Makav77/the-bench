import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { restrictUser, RestrictResponse } from "../../api/permissionsService";
import { DEFAULT_PERMISSIONS } from "../../../../backend/src/modules/Permissions/ListPermissions";
import { toast } from "react-toastify";

type Tab = "polls" | "bans" | "reports";

export default function DashboardPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>("bans");

    const [userId, setUserId] = useState<string>("");
    const [reason, setReason] = useState<string>("");
    const [days, setDays] = useState<number>(0);
    const [hours, setHours] = useState<number>(0);
    const [minutes, setMinutes] = useState<number>(0);
    const [selectedPermission, setSelectedPermission] = useState<string>(
        DEFAULT_PERMISSIONS[0].code
    );
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    if (!user || (user.role !== "admin" && user.role !== "moderator")) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500">
                    Accès refusé : vous n'êtes pas modérateur ni administrateur.
                </p>
            </div>
        );
    }

    const handleBanSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId.trim() || !reason.trim()) {
            toast.error("User ID and reason must be entered.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response: RestrictResponse = await restrictUser(
                selectedPermission,
                reason,
                userId,
                days,
                hours,
                minutes
            );
            toast.success("User successfully restricted.");
            setUserId("");
            setReason("");
            setDays(0);
            setHours(0);
            setMinutes(0);
            setSelectedPermission(DEFAULT_PERMISSIONS[0].code);
        } catch (error) {
            console.error(error);
            toast.error("Unable to ban user : " + error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 w-[60%] mx-auto">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

            <div className="flex border-b mb-6">
                <button
                    onClick={() => setActiveTab("polls")}
                    className={`px-4 py-2 -mb-px ${
                        activeTab === "polls"
                            ? "border-b-2 border-blue-600 font-semibold"
                            : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                    Polls
                </button>
                <button
                    onClick={() => setActiveTab("bans")}
                    className={`px-4 py-2 -mb-px ${
                        activeTab === "bans"
                            ? "border-b-2 border-blue-600 font-semibold"
                            : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                    Bans
                </button>
                <button
                    onClick={() => setActiveTab("reports")}
                    className={`px-4 py-2 -mb-px ${
                        activeTab === "reports"
                            ? "border-b-2 border-blue-600 font-semibold"
                            : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                    Reports
                </button>
            </div>

            {activeTab === "polls" && (
                <div>
                    <p className="text-gray-600">Polls handling</p>
                </div>
            )}

            {activeTab === "reports" && (
                <div>
                    <p className="text-gray-600">Reports handling</p>
                </div>
            )}

            {activeTab === "bans" && (
                <div>
                    <h2 className="text-2xl font-semibold mb-4">
                        Ban user
                    </h2>

                    <form
                        onSubmit={handleBanSubmit}
                        className="space-y-4 bg-white p-6 rounded shadow"
                    >
                        <div>
                            <label className="block font-semibold mb-1">
                                Permission to restrict
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
                                User ID to ban
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="userId"
                                type="text"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="w-full border rounded px-2 py-1"
                                placeholder="UUID de l'utilisateur"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold mb-1">
                                Reason
                                <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="reason"
                                rows={3}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full border rounded px-2 py-1"
                                placeholder="Ex : Comportement inapproprié…"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block font-semibold mb-1">
                                    Days
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
                                    Hours
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
                                    Minutes
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
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-50"
                            >
                                {isSubmitting ? "En cours…" : "Bannir"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
