import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import { restrictUser, RestrictResponse } from "../../api/permissionsService";
import { getReports, updateReport, ReportDTO } from "../../api/reportService";
import { DEFAULT_PERMISSIONS } from "../../../../backend/src/modules/Permissions/ListPermissions";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

type Tab = "polls" | "bans" | "reports";

export default function DashboardPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>("bans");
    const navigate = useNavigate();

    //bans
    const [userId, setUserId] = useState<string>("");
    const [reason, setReason] = useState<string>("");
    const [days, setDays] = useState<number>(0);
    const [hours, setHours] = useState<number>(0);
    const [minutes, setMinutes] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [selectedPermission, setSelectedPermission] = useState<string>(
        DEFAULT_PERMISSIONS[0].code
    );

    //reports
    const [reports, setReports] = useState<ReportDTO[]>([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loadingReports, setLoadingReports] = useState<boolean>(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "VALIDATED" | "REJECTED" >("ALL");
    const [filterContentType, setFilterContentType] = useState<"ALL" | "POST" | "FLASHPOST" | "EVENT" | "GALLERY" | "POLLS" | "CHALLENGES">("ALL");
    const [filterReason, setFilterReason] = useState<"ALL" | "OFFENSIVE_LANGUAGE" | "HATE_SPEECH" | "SPAM" | "INAPPROPRIATE_CONTENT" | "OTHER">("ALL");
    const [search, setSearch] = useState<string>("");

    useEffect(() => {
        setLoadingReports(true);
        (async () => {
            try {
                const { data, lastPage } = await getReports(page, 10);
                setReports(data);
                setLastPage(lastPage);
            } catch(error) {
                console.error("getReports error : " + error);
                toast.error("Unable to load reports.");
            } finally {
                setLoadingReports(false);
            }
        })();
    }, [activeTab, page]);

    if (!user || (user.role !== "admin" && user.role !== "moderator")) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500">
                    Access denied: You are not a moderator or administrator.
                </p>
            </div>
        );
    }

    const filteredReports = reports
        .filter((report) => {
            if (filterStatus === "ALL") {
                return true;
            }
            return report.status === filterStatus;
        })

        .filter((report) => {
            if (filterContentType === "ALL"){
                return true;
            }
            return report.reportedContentType === filterContentType;
        })

        .filter((report) => {
            if (filterReason === "ALL") {
                return true;
            }
            return report.reason === filterReason;
        })

        .filter((report) => {
            if (!search.trim()) {
                return true;
            }

            const term = search.trim().toLowerCase();
            const first = report.reportedUser.firstname.toLowerCase();
            const last = report.reportedUser.lastname.toLowerCase();
            return first.includes(term) || last.includes(term);
    });

    const handleBanSubmit = async (e: FormEvent) => {
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

    const handleStatusChanged = async (reportId: string, newStatus: "VALIDATED" | "REJECTED") => {
        setUpdatingId(reportId);
        try {
            await updateReport(reportId, { status: newStatus });
            toast.success(`Report ${newStatus === "VALIDATED" ? "Validate" : "Rejected" }`);
            setLoadingReports(true);
            const { data } = await getReports(page, 10);
            setReports(data);
        } catch (error) {
            console.error("Update report error : " + error);
            toast.error("Unable to update report.");
        } finally {
            setUpdatingId(null);
            setLoadingReports(false);
        }
    };

    const goToReportedContent = (reportedContentId: string, reportedContentType: string) => {
        switch (reportedContentType) {
            case "posts":
                navigate(`/posts/${reportedContentId}`);
                break;
            case "flashposts":
                navigate(`/flashposts/${reportedContentId}`);
                break;
            case "events":
                navigate(`/events/${reportedContentId}`);
                break;
            case "gallery":
                navigate(`/gallery/${reportedContentId}`);
                break;
            case "polls":
                navigate(`/polls/${reportedContentId}`);
                break;
            case "challenges":
                navigate(`/challenges/${reportedContentId}`);
                break;
            case "report":
                navigate("/homepage");
                break;
            default:
                toast.error("No report.");
        }
    }

    return (
        <div className="p-6 w-[30%] mx-auto">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

            <div className="flex border-b mb-6">
                <button
                    onClick={() => setActiveTab("polls")}
                    className={`cursor-pointer px-4 py-2 -mb-px ${
                        activeTab === "polls"
                            ? "border-b-2 border-blue-600 font-semibold"
                            : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                    Polls
                </button>
                <button
                    onClick={() => setActiveTab("bans")}
                    className={`cursor-pointer px-4 py-2 -mb-px ${
                        activeTab === "bans"
                            ? "border-b-2 border-blue-600 font-semibold"
                            : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                    Bans
                </button>
                <button
                    onClick={() => setActiveTab("reports")}
                    className={`cursor-pointer px-4 py-2 -mb-px ${
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
                    <h2 className="text-2xl font-semibold mb-4">
                        Reports
                    </h2>

                    <div className="mb-4 flex items-center space-x-2">
                        <span className="font-semibold">Reported user : </span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Firstname or lastname of user..."
                            className="border rounded px-2 py-1 w-full max-w-xs"
                        />
                    </div>

                    <div className="mb-4 flex items-center space-x-2">
                        <span className="font-semibold">Status :</span>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as "ALL" | "PENDING" | "VALIDATED" | "REJECTED")}
                            className="border rounded px-2 py-1"
                        >
                            <option value="ALL">All</option>
                            <option value="PENDING">Pending</option>
                            <option value="VALIDATED">Validated</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>

                    <div className="mb-4 flex items-center space-x-2">
                        <span className="font-semibold">Content :</span>
                        <select
                            value={filterContentType}
                            onChange={(e) => setFilterContentType(e.target.value as "ALL" | "POST" | "FLASHPOST" | "EVENT" | "GALLERY" | "POLLS" | "CHALLENGES")}
                            className="border rounded px-2 py-1"
                        >
                            <option value="ALL">All</option>
                            <option value="POST">Post</option>
                            <option value="FLASHPOST">Flashpost</option>
                            <option value="EVENT">Event</option>
                            <option value="GALLERY">Gallery</option>
                            <option value="POLL">Poll</option>
                            <option value="CHALLENGE">Challenge</option>
                        </select>
                    </div>

                    <div className="mb-4 flex items-center space-x-2">
                        <span className="font-semibold">Reason :</span>
                        <select
                            value={filterReason}
                            onChange={(e) => setFilterReason(e.target.value as "ALL" | "OFFENSIVE_LANGUAGE" | "HATE_SPEECH" | "SPAM" | "INAPPROPRIATE_CONTENT" | "OTHER")}
                            className="border rounded px-2 py-1"
                        >
                            <option value="ALL">All</option>
                            <option value="OFFENSIVE_LANGUAGE">Offensive language</option>
                            <option value="HATE_SPEECH">Hate speech</option>
                            <option value="SPAM">Spam</option>
                            <option value="INAPPROPRIATE_CONTENT">Inappropriate content</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    {loadingReports ? (
                        <p className="text-center">Report loading...</p>
                    ) : filteredReports.length === 0 ? (
                        <p className="text-center">No report waiting</p>
                    ) : (
                        <div className="space-y-4">
                            {filteredReports.map((report) => (
                                <div
                                    key={report.id}
                                    className="border rounded-lg p-4 shadow-sm flex flex-col md:flex-row justify-between cursor-pointer hover:bg-blue-200"
                                    onClick={() => goToReportedContent(report.reportedContentId, report.reportedContentType)}
                                >
                                    <div className="flex-1 space-y-1">
                                        <p>
                                            <span className="font-semibold">Report by :</span>{" "}
                                            {report.reporter.firstname} {report.reporter.lastname}
                                        </p>

                                        <p>
                                            <span className="font-semibold">Reported user :</span>{" "}
                                            {report.reportedUser.firstname} {report.reportedUser.lastname}
                                        </p>

                                        <p>
                                            <span className="font-semibold">Date :</span>{" "}
                                            {format(new Date(report.createdAt), "dd/MM/yyyy 'at' HH:mm")}
                                        </p>

                                        <p>
                                            <span className="font-semibold">Reason :</span>{" "}
                                            {report.reason}
                                        </p>

                                        {report.description && (
                                            <p>
                                                <span className="font-semibold">Description :</span>{" "}
                                                {report.description}
                                            </p>
                                        )}

                                        <p>
                                            <span className="font-semibold">Statut :</span>{" "}
                                            {report.status}
                                        </p>
                                    </div>

                                    <div className="mt-4 md:mt-0 md:ml-4 flex-shrink-0 flex flex-col space-y-2">
                                        {report.status === "PENDING" ? (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusChanged(report.id, "VALIDATED");
                                                    }}
                                                    disabled={updatingId === report.id}
                                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300 cursor-pointer"
                                                >
                                                    {updatingId === report.id
                                                        ? "Validation..."
                                                        : "Validate"}
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleStatusChanged(report.id, "REJECTED");
                                                    }}
                                                    disabled={updatingId === report.id}
                                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300 cursor-pointer">
                                                        {updatingId === report.id
                                                            ? "Rejection..."
                                                            : "Reject"}
                                                </button>
                                            </>
                                        ) : (
                                            <p className="text-gray-600 italic">
                                                Action performed
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <div className="flex justify-center items-center mt-6 gap-4">
                                <button
                                    type="button"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                                >
                                    ← Prev
                                </button>

                                <span>
                                    Page {page} / {lastPage}
                                </span>

                                <button
                                    type="button"
                                    disabled={page >= lastPage}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}
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
