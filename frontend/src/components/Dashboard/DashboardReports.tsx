import { useState, useEffect } from "react";
import { getReports, updateReport, ReportDTO } from "../../api/reportService";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

type StatusFilter = "ALL" | "PENDING" | "VALIDATED" | "REJECTED";
type ContentFilter = "ALL" | "POST" | "FLASHPOST" | "EVENT" | "GALLERY" | "POLLS" | "CHALLENGES";
type ReasonFilter = "ALL" | "OFFENSIVE_LANGUAGE" | "HATE_SPEECH" | "SPAM" | "INAPPROPRIATE_CONTENT" | "OTHER";

function DashboardReports() {
    const navigate = useNavigate();

    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [reports, setReports] = useState<ReportDTO[]>([]);
    const [loadingReports, setLoadingReports] = useState<boolean>(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<StatusFilter>("ALL");
    const [filterContentType, setFilterContentType] = useState<ContentFilter>("ALL");
    const [filterReason, setFilterReason] = useState<ReasonFilter>("ALL");
    const [search, setSearch] = useState<string>("");

    useEffect(() => {
        setLoadingReports(true);
        (async () => {
            try {
                const { data, lastPage } = await getReports(page, 10);
                setReports(data);
                setLastPage(lastPage);
            } catch (error) {
                console.error("getReports error : " + error);
                toast.error("Unable to load reports.");
            } finally {
                setLoadingReports(false);
            }
        })();
    }, [page]);

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
            case "POST":
                navigate(`/posts/${reportedContentId}`);
                break;
            case "FLASHPOST":
                navigate(`/flashposts/${reportedContentId}`);
                break;
            case "EVENT":
                navigate(`/events/${reportedContentId}`);
                break;
            case "GALLERY":
                navigate(`/gallery/${reportedContentId}`);
                break;
            case "POLL":
                navigate(`/polls/${reportedContentId}`);
                break;
            case "CHALLENGE":
                navigate(`/challenges/${reportedContentId}`);
                break;
            case "NEWS":
                navigate(`/news/${reportedContentId}`);
                break;
            case "report":
                navigate("/homepage");
                break;
            default:
                toast.error("No report.");
        }
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

    return (
        <div className="bg-white p-6 rounded-2xl">
            <h2 className="text-2xl font-semibold mb-4">
                Reports
            </h2>

            <div className="border-t-2 h-1 mb-5"></div>

            <div className="mb-4 flex items-center space-x-2">
                <span className="font-semibold w-[25%] text-end">Reported user : </span>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Firstname or lastname of user..."
                    className="border rounded px-2 py-1 w-full max-w-xs h-8"
                />
            </div>

            <div className="mb-4 flex items-center space-x-2">
                <span className="font-semibold w-[25%] text-end">Status :</span>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as "ALL" | "PENDING" | "VALIDATED" | "REJECTED")}
                    className="border rounded px-2 py-1 h-8"
                >
                    <option value="ALL">All</option>
                    <option value="PENDING">Pending</option>
                    <option value="VALIDATED">Validated</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            <div className="mb-4 flex items-center space-x-2">
                <span className="font-semibold w-[25%] text-end">Content :</span>
                <select
                    value={filterContentType}
                    onChange={(e) => setFilterContentType(e.target.value as "ALL" | "POST" | "FLASHPOST" | "EVENT" | "GALLERY" | "POLLS" | "CHALLENGES")}
                    className="border rounded px-2 py-1 h-8"
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
                <span className="font-semibold w-[25%] text-end">Reason :</span>
                <select
                    value={filterReason}
                    onChange={(e) => setFilterReason(e.target.value as "ALL" | "OFFENSIVE_LANGUAGE" | "HATE_SPEECH" | "SPAM" | "INAPPROPRIATE_CONTENT" | "OTHER")}
                    className="border rounded px-2 py-1 h-8"
                >
                    <option value="ALL">All</option>
                    <option value="OFFENSIVE_LANGUAGE">Offensive language</option>
                    <option value="HATE_SPEECH">Hate speech</option>
                    <option value="SPAM">Spam</option>
                    <option value="INAPPROPRIATE_CONTENT">Inappropriate content</option>
                    <option value="OTHER">Other</option>
                </select>
            </div>

            <div className="border-t-2 h-1 mb-5"></div>

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

                            <div className="mt-4 md:mt-0 md:ml-4 flex-shrink-0 flex flex-col space-y-2 justify-center">
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
                                    <p className="text-gray-600 italic text-center border-l-1 pl-4">
                                        Action performed by<br />
                                        {report.treatedBy
                                            ? `${report.treatedBy.firstname} ${report.treatedBy.lastname}`
                                            : "Unknown"}
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
    );
}

export default DashboardReports;
