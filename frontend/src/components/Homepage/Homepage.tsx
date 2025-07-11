import WeatherCard from "./Cards/WeatherCard";
import LatestMarketItemCard from "./Cards/LatestMarketItemCard";
import LatestPostCard from "./Cards/LatestPostCard";
import LatestFlashPostCard from "./Cards/LatestFlashPostCard";
import NextEventCard from "./Cards/NextEventCard";
import { useTranslation } from "react-i18next";

function Homepage() {
    const { t } = useTranslation("Homepage/Homepage");

return (
    <div>
        <div className="p-6 w-[70%] mx-auto max-sm:p-2 max-sm:w-[94vw]">
            <p className="text-xl bg-white rounded-3xl p-6 font-semibold max-sm:text-lg max-sm:rounded-2xl max-sm:p-3">
                {t("introduction")}
            </p>
        </div>
        <div className="p-6 w-[70%] mx-auto max-sm:p-2 max-sm:w-[94vw]">
            <div className="grid grid-cols-2 grid-rows-3 gap-4 rounded-3xl bg-white max-sm:grid-cols-1 max-sm:grid-rows-6 max-sm:gap-2 max-sm:rounded-2xl">
                <div className="bg-[#00c6ff] col-span-1 row-span-1 m-5 grid rounded-3xl max-sm:m-2 max-sm:rounded-2xl">
                    <h1 className="font-bold text-2xl text-left p-3 max-sm:text-lg max-sm:p-2">{t("suggestions")}</h1>
                </div>

                <div className="bg-[#00c6ff] col-span-1 row-span-1 m-5 grid rounded-3xl max-sm:m-2 max-sm:rounded-2xl">
                    <h1 className="font-bold text-2xl text-left p-3 max-sm:text-lg max-sm:p-2">{t("weather")}</h1>
                    <WeatherCard />
                </div>

                <div className="bg-[#00c6ff] col-span-1 row-span-1 m-5 grid rounded-3xl max-sm:m-2 max-sm:rounded-2xl">
                    <h1 className="font-bold text-2xl text-left p-3 max-sm:text-lg max-sm:p-2">{t("item")}</h1>
                    <LatestMarketItemCard />
                </div>

                <div className="bg-[#00c6ff] col-span-1 row-span-1 m-5 grid rounded-3xl max-sm:m-2 max-sm:rounded-2xl">
                    <h1 className="font-bold text-2xl text-left p-3 max-sm:text-lg max-sm:p-2">{t("post")}</h1>
                    <LatestPostCard />
                </div>

                <div className="bg-[#00c6ff] col-span-1 row-span-1 m-5 grid rounded-3xl max-sm:m-2 max-sm:rounded-2xl">
                    <p className="font-bold text-2xl text-left p-3 max-sm:text-lg max-sm:p-2">{t("event")}</p>
                    <NextEventCard />
                </div>

                <div className="bg-[#00c6ff] col-span-1 row-span-1 m-5 grid rounded-3xl max-sm:m-2 max-sm:rounded-2xl">
                    <p className="font-bold text-2xl text-left p-3 max-sm:text-lg max-sm:p-2">{t("flashpost")}</p>
                    <LatestFlashPostCard />
                </div>
            </div>
        </div>
    </div>
);

}

export default Homepage;
