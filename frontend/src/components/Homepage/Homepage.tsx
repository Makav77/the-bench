import WeatherCard from "./Cards/WeatherCard";
import LatestMarketItemCard from "./Cards/LatestMarketItemCard";
import LatestPostCard from "./Cards/LatestPostCard";
import LatestFlashPostCard from "./Cards/LatestFlashPostCard";
import NextEventCard from "./Cards/NextEventCard";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Homepage() {
    const navigate = useNavigate();
    const { t } = useTranslation("Homepage/Homepage");

    return (
        <div>
            <div className="p-6 w-[70%] mx-auto">
                <p className="text-xl bg-white rounded-3xl p-6 font-semibold">
                    {t("introduction")}
                </p>
            </div>
            <div className="p-6 w-[70%] mx-auto">
                <div className="grid grid-cols-2 grid-rows-3 gap-4 rounded-3xl bg-white">
                    <div className="bg-[#00c6ff] col-span-1 row-span-1 m-5 grid rounded-3xl">
                        <h1 className="font-bold text-2xl text-left p-3">{t("suggestions")}</h1>
                    </div>

                    <div className="bg-[#00c6ff] col-span-1 row-span-1 m-5 grid rounded-3xl">
                        <h1 className="font-bold text-2xl text-left p-3">{t("weather")}</h1>
                        <WeatherCard />
                    </div>

                    <div className="bg-[#00c6ff] col-span-1 row-span-1 m-5 grid rounded-3xl">
                        <h1 className="font-bold text-2xl text-left p-3">{t("item")}</h1>
                        <LatestMarketItemCard />
                    </div>

                    <div className="bg-[#00c6ff] col-span-1 row-span-1 m-5 grid rounded-3xl">
                        <h1 className="font-bold text-2xl text-left p-3">{t("post")}</h1>
                        <LatestPostCard />
                    </div>

                    <div className="bg-[#00c6ff] col-span-1 row-span-1 m-5 grid rounded-3xl">
                        <p className="font-bold text-2xl text-left p-3">{t("event")}</p>
                        <NextEventCard />
                    </div>

                    <div className="bg-[#00c6ff] col-span-1 row-span-1 m-5 grid rounded-3xl">
                        <p className="font-bold text-2xl text-left p-3">{t("flashpost")}</p>
                        <LatestFlashPostCard />
                    </div>
                </div>

                <div 
                    className="fixed right-0 top-[88.2%] w-[10%] bg-blue-500 text-white mr-5 p-2 text-center rounded-lg cursor-pointer hover:bg-white hover:border hover:text-blue-500 hover:font-semibold"
                    onClick={() => navigate("/chat")}
                    >
                    {t("messages")}
                </div>
            </div>
        </div>
    );
}

export default Homepage;
