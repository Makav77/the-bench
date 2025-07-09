import { useState } from "react";
import DashboardChallenges from "./DashboardChallenges";
import DashboardReports from "./DashboardReports";
import DashboardRestrictions from "./DashboardRestrictions";
import DashboardNews from "./DashboardNews";
import { useTranslation } from "react-i18next";

type Tab = "challenges" | "restrictions" | "reports" | "news";

function DashboardPage() {
    const [activeTab, setActiveTab] = useState<Tab>("restrictions");
    const { t } = useTranslation("Dashboard/Dashboard");

    return (
        <div className="p-6 w-[30%] mx-auto max-sm:w-full max-sm:p-2">
            <h1 className="text-4xl font-bold mb-4 max-sm:text-4xl max-sm:text-center">{t("dashboard")}</h1>

            <div className="flex border-b mb-6 max-sm:flex-col max-sm:gap-2 max-sm:border-none">
                <button
                    onClick={() => setActiveTab("challenges")}
                    className={`cursor-pointer px-4 py-2 -mb-px max-sm:px-3 max-sm:py-3 max-sm:text-lg max-sm:w-full max-sm:rounded max-sm:shadow
                        ${activeTab === "challenges"
                            ? "border-b-2 border-blue-600 font-semibold max-sm:border-b-0 max-sm:bg-blue-200 max-sm:text-blue-700 max-sm:font-bold max-sm:shadow-lg"
                            : "text-gray-600 hover:text-gray-800 max-sm:bg-gray-100 max-sm:text-gray-500 max-sm:font-normal"}`
                    }
                >
                    {t("challenges")}
                </button>
                <button
                    onClick={() => setActiveTab("restrictions")}
                    className={`cursor-pointer px-4 py-2 -mb-px max-sm:px-3 max-sm:py-3 max-sm:text-lg max-sm:w-full max-sm:rounded max-sm:shadow
                        ${activeTab === "restrictions"
                            ? "border-b-2 border-blue-600 font-semibold max-sm:border-b-0 max-sm:bg-blue-200 max-sm:text-blue-700 max-sm:font-bold max-sm:shadow-lg"
                            : "text-gray-600 hover:text-gray-800 max-sm:bg-gray-100 max-sm:text-gray-500 max-sm:font-normal"}`
                    }
                >
                    {t("restrictions")}
                </button>
                <button
                    onClick={() => setActiveTab("reports")}
                    className={`cursor-pointer px-4 py-2 -mb-px max-sm:px-3 max-sm:py-3 max-sm:text-lg max-sm:w-full max-sm:rounded max-sm:shadow
                        ${activeTab === "reports"
                            ? "border-b-2 border-blue-600 font-semibold max-sm:border-b-0 max-sm:bg-blue-200 max-sm:text-blue-700 max-sm:font-bold max-sm:shadow-lg"
                            : "text-gray-600 hover:text-gray-800 max-sm:bg-gray-100 max-sm:text-gray-500 max-sm:font-normal"}`
                    }
                >
                    {t("reports")}
                </button>
                <button
                    onClick={() => setActiveTab("news")}
                    className={`cursor-pointer px-4 py-2 -mb-px max-sm:px-3 max-sm:py-3 max-sm:text-lg max-sm:w-full max-sm:rounded max-sm:shadow
                        ${activeTab === "news"
                            ? "border-b-2 border-blue-600 font-semibold max-sm:border-b-0 max-sm:bg-blue-200 max-sm:text-blue-700 max-sm:font-bold max-sm:shadow-lg"
                            : "text-gray-600 hover:text-gray-800 max-sm:bg-gray-100 max-sm:text-gray-500 max-sm:font-normal"}`
                    }
                >
                    {t("news")}
                </button>
            </div>

            {activeTab === "challenges" && <DashboardChallenges />}
            {activeTab === "restrictions" && <DashboardRestrictions />}
            {activeTab === "reports" && <DashboardReports />}
            {activeTab === "news" && <DashboardNews />}
        </div>


    );
}

export default DashboardPage;
