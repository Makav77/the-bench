import { useState } from "react";
import DashboardChallenges from "./DashboardChallenges";
import DashboardReports from "./DashboardReports";
import DashboardRestrictions from "./DashboardRestrictions";
import DashboardNews from "./DashboardNews";
import DashboardHangman from "./DashboardHangman"
import { useTranslation } from "react-i18next";

type Tab = "challenges" | "restrictions" | "reports" | "news" | "hangman";

function DashboardPage() {
    const [activeTab, setActiveTab] = useState<Tab>("restrictions");
    const { t } = useTranslation("Dashboard/Dashboard");

    return (
        <div className="p-6 w-[30%] mx-auto">
            <h1 className="text-3xl font-bold mb-4">{t("dashboard")}</h1>

            <div className="flex border-b mb-6">
                <button
                    onClick={() => setActiveTab("challenges")}
                    className={`cursor-pointer px-4 py-2 -mb-px ${
                        activeTab === "challenges"
                            ? "border-b-2 border-blue-600 font-semibold"
                            : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                    {t("challenges")}
                </button>
                <button
                    onClick={() => setActiveTab("restrictions")}
                    className={`cursor-pointer px-4 py-2 -mb-px ${
                        activeTab === "restrictions"
                            ? "border-b-2 border-blue-600 font-semibold"
                            : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                    {t("restrictions")}
                </button>
                <button
                    onClick={() => setActiveTab("reports")}
                    className={`cursor-pointer px-4 py-2 -mb-px ${
                        activeTab === "reports"
                            ? "border-b-2 border-blue-600 font-semibold"
                            : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                    {t("reports")}
                </button>
                <button
                    onClick={() => setActiveTab("news")}
                    className={`cursor-pointer px-4 py-2 -mb-px ${
                        activeTab === "news"
                            ? "border-b-2 border-blue-600 font-semibold"
                            : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                    {t("news")}
                </button>
                <button
                    onClick={() => setActiveTab("hangman")}
                    className={`cursor-pointer px-4 py-2 -mb-px ${
                        activeTab === "hangman"
                            ? "border-b-2 border-blue-600 font-semibold"
                            : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                    {t("hangman")}
                </button>
            </div>

            {activeTab === "challenges" && <DashboardChallenges />}
            {activeTab === "restrictions" && <DashboardRestrictions />}
            {activeTab === "reports" && <DashboardReports />}
            {activeTab === "news" && <DashboardNews />}
            {activeTab === "hangman" && <DashboardHangman />}
        </div>
    );
}

export default DashboardPage;