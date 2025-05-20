import WeatherCard from "./Cards/WeatherCard";
import LatestMarketItemCard from "./Cards/LatestMarketItemCard";
import LatestPostCard from "./Cards/LatestPostCard";
import LatestFlashPostCard from "./Cards/LatestFlashPostCard";
import NextEventCard from "./Cards/NextEventCard";

function Homepage() {
    return (
        <div>
            <div className="p-6 w-[70%] mx-auto">
                <p className="text-xl bg-white rounded-3xl p-6 font-semibold">
                    Welcome to "The Bench", your app dedicated to the residents of your neighborhood, allowing you to connect, organize events, exchange services and strengthen the social bonds of your neighborhood.
                </p>
            </div>
            <div className="p-6 w-[70%] mx-auto">
                <div className="grid grid-cols-2 grid-rows-3 gap-4 border-3 bg-white">
                    <div className="bg-[#77B5F5] col-span-1 row-span-1 border-1 m-5 grid rounded-3xl">
                        <h1 className="font-bold text-2xl text-left p-3">Suggestions</h1>
                    </div>

                    <div className="bg-[#77B5F5] col-span-1 row-span-1 border-1 m-5 grid rounded-3xl">
                        <h1 className="font-bold text-2xl text-left p-3">Weather</h1>
                        <WeatherCard />
                    </div>

                    <div className="bg-[#77B5F5] col-span-1 row-span-1 border-1 m-5 grid rounded-3xl">
                        <h1 className="font-bold text-2xl text-left p-3">Last item on sell</h1>
                        <LatestMarketItemCard />
                    </div>

                    <div className="bg-[#77B5F5] col-span-1 row-span-1 border-1 m-5 grid rounded-3xl">
                        <h1 className="font-bold text-2xl text-left p-3">Last post</h1>
                        <LatestPostCard />
                    </div>

                    <div className="bg-[#77B5F5] col-span-1 row-span-1 border-1 m-5 grid rounded-3xl">
                        <p className="font-bold text-2xl text-left p-3">Next event</p>
                        <NextEventCard />
                    </div>

                    <div className="bg-[#77B5F5] col-span-1 row-span-1 border-1 m-5 grid rounded-3xl">
                        <p className="font-bold text-2xl text-left p-3">Last flash post</p>
                        <LatestFlashPostCard />
                    </div>
                </div>

                <div className="fixed right-0 top-[88.2%] w-[10%] bg-blue-500 text-white mr-5 p-2 text-center rounded-lg cursor-pointer hover:bg-white hover:border hover:text-blue-500 hover:font-semibold">
                    Messages
                </div>
            </div>
        </div>
    );
}

export default Homepage;
