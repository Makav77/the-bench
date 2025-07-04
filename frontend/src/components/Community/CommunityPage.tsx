import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function CommunityPage() {
    const navigate = useNavigate();
    const { t } = useTranslation("Community/Community");

    const sections = [
        { label: t("gallery"), path: '/gallery' },
        { label: t("polls"), path: '/polls' },
        { label: t("challenges"), path: '/challenges' },
        { label: t("calendar"), path: '/calendar' },
        { label: t("artisans"), path: '/artisans' },
        { label: t("news"), path: '/news' },
    ];

    return (
        <div className="p-6 w-[40%] mx-auto">
            <h1 className="text-3xl font-bold mb-8">{t("community")}</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {sections.map(({ label, path }) => (
                <button
                    key={path}
                    onClick={() => navigate(path)}
                    className="p-6 bg-white rounded-lg shadow hover:shadow-md transition flex items-center justify-center font-semibold text-lg cursor-pointer hover:bg-gray-200"
                >
                    {label}
                </button>
                ))}
            </div>
        </div>
    );
}
 