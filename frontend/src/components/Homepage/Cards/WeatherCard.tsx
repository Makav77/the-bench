import { useState, useEffect } from "react";
import axios from "axios";

function WeatherCard() {
    const [weather, setWeather] = useState<{ temp: number, desc: string } | null>(null);

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
            <div>Chargement météo ...</div>
        );
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-1">
                Météo du quartier
            </h3>
            <p>{weather.temp.toFixed(1)}°C, {weather.desc}</p>
        </div>
    );
}

export default WeatherCard;
