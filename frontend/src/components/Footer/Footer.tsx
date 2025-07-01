import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getModeratorsAndAdmins } from "../../api/userService";
import { StaffDTO } from "../../api/userService";

function Footer() {
    const navigate = useNavigate();
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
            className="bg-[#00c6ff] border-t-2 mt-10"
        >
            <div className="flex justify-between w-[30%] mx-auto mt-5 p-6">
                <div className="flex flex-col items-start space-y-1">
                    <p className="font-semibold">See also :</p>
                    <button
                        type="button"
                        className="cursor-pointer hover:underline"
                        onClick={() => navigate("/homepage")}
                    >
                        → Homepage
                    </button>

                    <button
                        type="button"
                        className="cursor-pointer hover:underline"
                        onClick={() => navigate("/marketplace")}
                    >
                        → Marketplace
                    </button>

                    <button
                        type="button"
                        className="cursor-pointer hover:underline"
                        onClick={() => navigate("/bulletinsboard")}
                    >
                        → Bulletins board
                    </button>

                    <button
                        type="button"
                        className="cursor-pointer hover:underline"
                        onClick={() => navigate("/events")}
                    >
                        → Events
                    </button>

                    <button
                        type="button"
                        className="cursor-pointer hover:underline"
                        onClick={() => navigate("/community")}
                    >
                        → Community
                    </button>
                </div>

                <div>
                    <div>
                        <ul>
                            <li
                                className="hover:underline cursor-pointer"
                                onClick={() => setShowModeratorsModal(true)}
                            >
                                Contact a moderator</li>
                            <li
                                className="hover:underline cursor-pointer"
                                onClick={() => navigate("/termsofuse")}
                            >
                                Conditions of use
                            </li>
                        </ul>
                    </div>

                    <br />

                    <div>
                        <ul>
                            <li
                                className="flex gap-3 hover:underline cursor-pointer"
                                onClick={() => navigate("https://github.com/NabilBoubekri")}
                            >
                                <img
                                    src="../../../public/assets/github-logo.png"
                                    alt="github-logo" className="h-5"
                                />
                                    NabilBoubekri
                            </li>

                            <li
                                className="flex gap-3 hover:underline cursor-pointer"
                                onClick={() => navigate("https://github.com/ksarlary")}
                            >
                                <img
                                    src="../../../public/assets/github-logo.png"
                                    alt="github-logo" className="h-5"
                                />
                                    ksarlary
                            </li>

                            <li
                                className="flex gap-3 hover:underline cursor-pointer"
                                onClick={() => navigate("https://github.com/Makav77")}
                            >
                                <img
                                    src="../../../public/assets/github-logo.png"
                                    alt="github-logo" className="h-5"
                                />
                                    Makav77
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <p className="text-l font-bold text-center">The Bench © 2025</p>

            {showModeratorsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
                    <div className="bg-white rounded-lg shadow-lg p-8 w-[400px] relative">
                        <h2 className="text-xl font-bold mb-4 text-center">Contact the staff</h2>
                        {loadingMods ? (
                            <p>Loading...</p>
                        ) : (
                            <>
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-red-600 mb-2">Admins</h3>
                                    {admins.length === 0
                                        ? <p className="italic text-gray-500">No admins</p>
                                        : (
                                            <ul className="space-y-2">
                                                {admins.map(a => (
                                                    <li
                                                        key={a.id}
                                                        className="cursor-pointer hover:underline"
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
                                    <h3 className="text-lg font-semibold text-blue-700 mb-2">Moderators</h3>
                                    {moderators.length === 0
                                        ? <p className="italic text-gray-500">No moderators for your neighborhood</p>
                                        : (
                                            <ul className="space-y-2">
                                                {moderators.map(m => (
                                                    <li
                                                        key={m.id}
                                                        className="cursor-pointer hover:underline"
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
