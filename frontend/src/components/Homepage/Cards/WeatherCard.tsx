import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

function WeatherCard() {
    const [weather, setWeather] = useState<{ temp: number, desc: string } | null>(null);
    const { t } = useTranslation("Homepage/WeatherCard");

    useEffect(() => {
        async function load() {
            try {
                const res = await axios.get("https://api.openweathermap.org/data/2.5/weather?q=Paris&units=metric&appid=f179f4dc24fbf272a93b8b2aa5877ba3");
                setWeather({
                    temp: res.data.main.temp,
                    desc: res.data.weather[0].description,
                });
            } catch(error) {
                console.error("Erreur météo :", error);
            }
        }
        load();
    }, []);

    if (!weather) {
        return (
            <div>
                {t("loading")}
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center items-center w-3/4 mx-auto bg-white rounded-2xl shadow h-25 px-5 pr-4  mb-10">
            <h3 className="text-lg font-bold">
                {t("weather")}
            </h3>
            <p>{weather.temp.toFixed(1)}°C, {weather.desc}</p>
        </div>
    );
}

export default WeatherCard;
