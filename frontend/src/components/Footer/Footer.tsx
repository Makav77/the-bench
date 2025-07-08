import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { getModeratorsAndAdmins } from "../../api/userService";
import { StaffDTO } from "../../api/userService";
import LanguageSwitcher from "../Utils/LanguageSwitcher";

function Footer() {
    const navigate = useNavigate();
    const { t } = useTranslation("Footer/Footer");
    const [showModeratorsModal, setShowModeratorsModal] = useState(false);
    const [admins, setAdmins] = useState<StaffDTO[]>([]);
    const [moderators, setModerators] = useState<StaffDTO[]>([]);
    const [loadingMods, setLoadingMods] = useState(false);

    useEffect(() => {
        if (!showModeratorsModal) {
            return;
        }

        const loadStaff = async () => {
            setLoadingMods(true);
            try {
                const { admins, moderators } = await getModeratorsAndAdmins();
                setAdmins(admins);
                setModerators(moderators);
            } catch {
                setAdmins([]);
                setModerators([]);
            } finally {
                setLoadingMods(false);
            }
        };
        loadStaff();
    }, [showModeratorsModal]);

return (
    <div
        data-test-id="footer"
        className="bg-[#00c6ff] border-t-2 mt-10 max-sm:mt-8"
    >
        <div className="flex justify-between w-[30%] mx-auto mt-5 p-6
                        max-sm:w-[96vw] max-sm:p-3 max-sm:mt-3 max-sm:flex-row max-sm:justify-between max-sm:gap-8">
            <div className="flex flex-col items-start space-y-1 max-sm:space-y-3 max-sm:w-1/2">
                <p className="font-semibold text-lg max-sm:text-lg">{t("seeAlso")}</p>
                <button
                    type="button"
                    className="cursor-pointer hover:underline text-base max-sm:text-base"
                    onClick={() => navigate("/homepage")}
                >
                    → {t("homepage")}
                </button>
                <button
                    type="button"
                    className="cursor-pointer hover:underline text-base max-sm:text-base"
                    onClick={() => navigate("/marketplace")}
                >
                    → {t("marketplace")}
                </button>
                <button
                    type="button"
                    className="cursor-pointer hover:underline text-base max-sm:text-base"
                    onClick={() => navigate("/bulletinsboard")}
                >
                    → {t("bulletinsBoard")}
                </button>
                <button
                    type="button"
                    className="cursor-pointer hover:underline text-base max-sm:text-base"
                    onClick={() => navigate("/events")}
                >
                    → {t("events")}
                </button>
                <button
                    type="button"
                    className="cursor-pointer hover:underline text-base max-sm:text-base"
                    onClick={() => navigate("/community")}
                >
                    → {t("community")}
                </button>
            </div>

            <div className="flex flex-col max-sm:items-end max-sm:w-1/2 max-sm:text-right">
                <ul className="mb-2 max-sm:mb-2">
                    <li
                        className="hover:underline cursor-pointer text-base max-sm:text-base"
                        onClick={() => setShowModeratorsModal(true)}
                    >
                        → {t("contactModerator")}
                    </li>
                    <li
                        className="hover:underline cursor-pointer text-base max-sm:text-base"
                        onClick={() => navigate("/termsofuse")}
                    >
                        → {t("conditionsOfUse")}
                    </li>
                </ul>
                <ul className="max-sm:space-y-2">
                    <li
                        className="flex gap-2 hover:underline cursor-pointer items-center max-sm:justify-end text-base max-sm:text-base"
                        onClick={() => navigate("https://github.com/NabilBoubekri")}
                    >
                        <img
                            src="../../../public/assets/github-logo.png"
                            alt="github-logo" className="h-5 max-sm:h-6"
                        />
                        NabilBoubekri
                    </li>
                    <li
                        className="flex gap-2 hover:underline cursor-pointer items-center max-sm:justify-end text-base max-sm:text-base"
                        onClick={() => navigate("https://github.com/ksarlary")}
                    >
                        <img
                            src="../../../public/assets/github-logo.png"
                            alt="github-logo" className="h-5 max-sm:h-6"
                        />
                        ksarlary
                    </li>
                    <li
                        className="flex gap-2 hover:underline cursor-pointer items-center max-sm:justify-end text-base max-sm:text-base"
                        onClick={() => navigate("https://github.com/Makav77")}
                    >
                        <img
                            src="../../../public/assets/github-logo.png"
                            alt="github-logo" className="h-5 max-sm:h-6"
                        />
                        Makav77
                    </li>
                </ul>
                <div className="max-sm:mt-3">
                    <LanguageSwitcher />
                </div>
            </div>
        </div>

        <p className="text-l font-bold text-center max-sm:text-base max-sm:mt-2">The Bench © 2025</p>

        {showModeratorsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
                <div className="bg-white rounded-lg shadow-lg p-8 w-[400px] relative max-sm:w-[92vw] max-sm:p-4">
                    <h2 className="text-xl font-bold mb-4 text-center max-sm:text-lg max-sm:mb-2">Contact the staff</h2>
                    {loadingMods ? (
                        <p className="max-sm:text-base">Loading...</p>
                    ) : (
                        <>
                            <div className="mb-6 max-sm:mb-3">
                                <h3 className="text-lg font-semibold text-red-600 mb-2 max-sm:text-base max-sm:mb-1">Admins</h3>
                                {admins.length === 0
                                    ? <p className="italic text-gray-500 max-sm:text-base">No admins</p>
                                    : (
                                        <ul className="space-y-2 max-sm:space-y-1">
                                            {admins.map(a => (
                                                <li
                                                    key={a.id}
                                                    className="cursor-pointer hover:underline text-base max-sm:text-base"
                                                    onClick={() => {
                                                        setShowModeratorsModal(false);
                                                        navigate(`/profile/${a.id}`);
                                                    }}
                                                >
                                                    → {a.firstname} {a.lastname}
                                                </li>
                                            ))}
                                        </ul>
                                    )
                                }
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-blue-700 mb-2 max-sm:text-base max-sm:mb-1">Moderators</h3>
                                {moderators.length === 0
                                    ? <p className="italic text-gray-500 max-sm:text-base">No moderators for your neighborhood</p>
                                    : (
                                        <ul className="space-y-2 max-sm:space-y-1">
                                            {moderators.map(m => (
                                                <li
                                                    key={m.id}
                                                    className="cursor-pointer hover:underline text-base max-sm:text-base"
                                                    onClick={() => {
                                                        setShowModeratorsModal(false);
                                                        navigate(`/profile/${m.id}`);
                                                    }}
                                                >
                                                    → {m.firstname} {m.lastname}
                                                </li>
                                            ))}
                                        </ul>
                                    )
                                }
                            </div>
                        </>
                    )}

                    <button
                        className="absolute top-2 right-2 text-gray-400 hover:text-black text-2xl cursor-pointer"
                        onClick={() => setShowModeratorsModal(false)}
                        aria-label="Close"
                    >×</button>
                </div>
            </div>
        )}
    </div>
);


}

export default Footer;
