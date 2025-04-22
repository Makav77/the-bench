import { useTranslation } from "react-i18next";
import Navigation from "../Navigation/Navigation";
import { useNavigate } from "react-router-dom";

function Header() {
    const { t } = useTranslation("Header");
    const navigate = useNavigate();

    return (
        <div data-testid="header">
            <div className="grid grid-cols-2 h-10 sm:grid-cols-3">
                <div className="flex items-center pl-5">
                    <img src="assets/bench-logo.png" alt="logo" className="h-10" />
                </div>

                <div className="hidden sm:flex items-center justify-center">
                    <p className="text-3xl">The Bench</p>
                </div>

                <div className="flex items-center justify-end">
                    <div>
                        <button
                            type="button"
                            aria-label="profile-button"
                            className="border text-[#488ACF] text-2xl sm:text-1xl font-bold p-1 m-2 bg-white rounded-lg sm:cursor-pointer sm:transition-all sm:duration-300"
                        >
                            {t("profile")}
                        </button>

                        <button
                            type="button"
                            aria-label="logout-button"
                            className="border text-[#488ACF] text-2xl sm:text-1xl font-bold p-1 m-1 bg-white rounded-lg sm:cursor-pointer sm:transition-all sm:duration-300"
                            onClick={() => navigate("/")}
                        >
                            {t("logout")}
                        </button>
                    </div>
                </div>
            </div>
            <Navigation />
            <div className="border-b-2" />
        </div>
    );
}

export default Header;
