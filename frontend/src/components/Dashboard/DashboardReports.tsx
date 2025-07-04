import { useState, useEffect } from "react";
import { getReports, updateReport, ReportDTO } from "../../api/reportService";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

type StatusFilter = "ALL" | "PENDING" | "VALIDATED" | "REJECTED";
type ContentFilter = "ALL" | "POST" | "FLASHPOST" | "EVENT" | "GALLERY" | "POLL" | "CHALLENGE";
type ReasonFilter = "ALL" | "OFFENSIVE_LANGUAGE" | "HATE_SPEECH" | "SPAM" | "INAPPROPRIATE_CONTENT" | "OTHER";

function DashboardReports() {
    const navigate = useNavigate();
    const { t } = useTranslation("Dashboard/DashboardReports");

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
                toast.error(t("toastLoadReportError"));
            } finally {
                setLoadingReports(false);
            }
        })();
    }, [page]);

    const contentTypeLabel = (type: string) => {
        switch (type) {
            case "POST":
                return "Post";
            case "FLASHPOST":
                return "Flashpost";
            case "EVENT":
                return "Event";
            case "GALLERY":
                return "Gallery";
            case "POLL":
                return "Poll";
            case "CHALLENGE":
                return "Challenge";
            case "NEWS":
                return "News";
            default:
                return type;
        }
    }

    const handleStatusChanged = async (reportId: string, newStatus: "VALIDATED" | "REJECTED") => {
        setUpdatingId(reportId);
        try {
            await updateReport(reportId, { status: newStatus });
            toast.success(`Report ${newStatus === "VALIDATED" ? "Validate" : "Rejected" }`);
            setLoadingReports(true);
            const { data } = await getReports(page, 10);
            setReports(data);
        } catch {
            toast.error(t("toastUpdateReportError"));
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
                navigate("/");
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
                {t("reports")}
            </h2>

            <div className="border-t-2 h-1 mb-5" />

            <div className="mb-4 flex items-center space-x-2">
                <span className="font-semibold w-[25%] text-end">{t("reportedUser")}</span>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("reportedUserPlaceholder")}
                    className="border rounded px-2 py-1 w-full max-w-xs h-8"
                />
            </div>

            <div className="mb-4 flex items-center space-x-2">
                <span className="font-semibold w-[25%] text-end">{t("status")}</span>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as "ALL" | "PENDING" | "VALIDATED" | "REJECTED")}
                    className="border rounded px-2 py-1 h-8"
                >
                    <option value="ALL">{t("all")}</option>
                    <option value="PENDING">{t("pending")}</option>
                    <option value="VALIDATED">{t("validated")}</option>
                    <option value="REJECTED">{t("rejected")}</option>
                </select>
            </div>

            <div className="mb-4 flex items-center space-x-2">
                <span className="font-semibold w-[25%] text-end">{t("content")}</span>
                <select
                    value={filterContentType}
                    onChange={(e) => setFilterContentType(e.target.value as "ALL" | "POST" | "FLASHPOST" | "EVENT" | "GALLERY" | "POLL" | "CHALLENGE")}
                    className="border rounded px-2 py-1 h-8"
                >
                    <option value="ALL">{t("all")}</option>
                    <option value="POST">{t("post")}</option>
                    <option value="FLASHPOST">{t("flashpost")}</option>
                    <option value="EVENT">{t("event")}</option>
                    <option value="GALLERY">{t("gallery")}</option>
                    <option value="POLL">{t("poll")}</option>
                    <option value="CHALLENGE">{t("challenge")}</option>
                </select>
            </div>

            <div className="mb-4 flex items-center space-x-2">
                <span className="font-semibold w-[25%] text-end">{t("reason")}</span>
                <select
                    value={filterReason}
                    onChange={(e) => setFilterReason(e.target.value as "ALL" | "OFFENSIVE_LANGUAGE" | "HATE_SPEECH" | "SPAM" | "INAPPROPRIATE_CONTENT" | "OTHER")}
                    className="border rounded px-2 py-1 h-8"
                >
                    <option value="ALL">{t("all")}</option>
                    <option value="OFFENSIVE_LANGUAGE">{t("offensiveLanguage")}</option>
                    <option value="HATE_SPEECH">{t("hateSpeech")}</option>
                    <option value="SPAM">{t("spam")}</option>
                    <option value="INAPPROPRIATE_CONTENT">{t("inappropriateContent")}</option>
                    <option value="OTHER">{t("other")}</option>
                </select>
            </div>

            <div className="border-t-2 h-1 mb-5" />

            {loadingReports ? (
                <p className="text-center">{t("loading")}</p>
            ) : filteredReports.length === 0 ? (
                <p className="text-center">{t("noWaitingReport")}</p>
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
                                    <span className="font-semibold">{t("reportedBy")}</span>{" "}
                                    <span
                                        className="text-blue-600 hover:underline cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/profile/${report.reporter.id}`);
                                        }}
                                    >
                                        {report.reporter.firstname} {report.reporter.lastname}
                                    </span>
                                </p>

                                <p>
                                    <span className="font-semibold">{t("reportedUser")}</span>{" "}
                                    <span
                                        className="text-blue-600 hover:underline cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/profile/${report.reportedUser.id}`);
                                        }}
                                    >
                                        {report.reportedUser.firstname} {report.reportedUser.lastname}
                                    </span>
                                </p>

                                <p>
                                    <span className="font-semibold">{t("content")}</span>{" "}
                                    <span>{contentTypeLabel(report.reportedContentType)}</span>
                                </p>

                                <p>
                                    <span className="font-semibold">{t("date")}</span>{" "}
                                    {format(new Date(report.createdAt), "dd/MM/yyyy 'at' HH:mm")}
                                </p>

                                <p>
                                    <span className="font-semibold">{t("reason")}</span>{" "}
                                    {report.reason}
                                </p>

                                {report.description && (
                                    <p>
                                        <span className="font-semibold">{t("description")}</span>{" "}
                                        {report.description}
                                    </p>
                                )}

                                <p>
                                    <span className="font-semibold">{t("status")}</span>{" "}
                                    <span className={
                                        report.status === "PENDING" ? "bg-yellow-400 px-2 rounded" :
                                        report.status === "VALIDATED" ? "bg-green-400 px-2 rounded" :
                                        "bg-red-400 px-2 rounded"
                                    }>
                                        {report.status}
                                    </span>
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
                                                ? t("validation")
                                                : t("validate")}
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleStatusChanged(report.id, "REJECTED");
                                            }}
                                            disabled={updatingId === report.id}
                                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300 cursor-pointer">
                                                {updatingId === report.id
                                                    ? t("rejection")
                                                    : t("reject")}
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
                            {t("previous")}
                        </button>

                        <span>
                            {t("page")} {page} / {lastPage}
                        </span>

                        <button
                            type="button"
                            disabled={page >= lastPage}
                            onClick={() => setPage((p) => p + 1)}
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                        >
                            {t("next")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardReports;
