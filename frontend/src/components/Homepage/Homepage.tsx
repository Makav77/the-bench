import WeatherCard from "./Cards/WeatherCard";

function Homepage() {
    return (
        <div className="p-6 w-[90%] mx-auto">
            <div className="grid grid-cols-2 grid-rows-3 gap-4 border-3 bg-white">
                <div className="bg-[#77B5F5] col-span-1 row-span-1 border-1 m-5 text-center h-50 grid place-items-center">Suggestions</div>
                <div className="bg-[#77B5F5] col-span-1 row-span-1 border-1 m-5 text-center h-50 grid place-items-center"><WeatherCard /></div>

                <div className="bg-[#77B5F5] col-span-1 row-span-1 border-1 m-5 text-center h-50 grid place-items-center">Dernier article</div>
                <div className="bg-[#77B5F5] col-span-1 row-span-1 border-1 m-5 text-center h-50 grid place-items-center">Dernière annonce</div>

                <div className="bg-[#77B5F5] col-span-1 row-span-1 border-1 m-5 text-center h-50 grid place-items-center">Prochain événement</div>
                <div className="bg-[#77B5F5] col-span-1 row-span-1 border-1 m-5 text-center h-50 grid place-items-center">Annonce flash</div>
            </div>
            <div className="fixed right-0 top-[88.2%] w-[10%] bg-blue-500 text-white mr-5 p-2 text-center rounded-lg cursor-pointer hover:bg-white hover:border hover:text-blue-500 hover:font-semibold">
                Messages
            </div>
        </div>
    );
}

export default Homepage;
