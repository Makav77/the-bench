import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchArtisansByType, fetchPlaceDetails, PlaceDetails } from "../../../components/Utils/PlacesService";

function computeDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371e3;
    const φ1 = toRad(lat1), φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1), Δλ = toRad(lng2 - lng1);
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export default function ArtisansByTypePage() {
    const { job } = useParams<{ job: string }>();
    const navigate = useNavigate();
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>();
    const [artisans, setArtisans] = useState<PlaceDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => { setError("Unable to retrieve position");
            setLoading(false); }
        );
    }, []);

    useEffect(() => {
        if (!userLocation || !job) {
            return;
        }
        setLoading(true);
        fetchArtisansByType(job, userLocation.lat, userLocation.lng, 5000)
            .then(async results => {
                const withDist = results.map(p => ({
                    summary: p,
                    distance: computeDistance(
                        userLocation.lat, userLocation.lng,
                        p.geometry.location.lat, p.geometry.location.lng
                    )
                }));
                const nearest = withDist.sort((a, b) => a.distance - b.distance).slice(0, 3);

                const detailsList = await Promise.all(
                    nearest.map(({ summary }) => fetchPlaceDetails(summary.place_id))
                );
                setArtisans(detailsList);
            })
            .catch(error => setError(String(error)))
            .finally(() => setLoading(false));
    }, [userLocation, job]);

    if (loading) {
        return <p className="p-4 text-center">Loading…</p>;
    }

    if (error) {
        return <p className="p-4 text-center text-red-500">Error : {error}</p>;
    }

    return (
        <div className="w-[25%] mx-auto my-10">
                <button
                    type="button"
                    onClick={() => navigate("/artisans")}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded transition-colors duration-150 cursor-pointer mb-5"
                >
                    ← Back to artisan list
                </button>
            <h2 className="text-2xl font-bold mb-4"><span className="capitalize">{job}</span> arounde me</h2>
            {artisans.length > 0 ? (
                <ul className="space-y-6">
                    {artisans.map(a => (
                        <li 
                            key={a.place_id}
                            className="border rounded-2xl p-6 shadow-xl bg-white"
                        >
                            <h3 className="text-xl font-bold">{a.name}</h3>
                            <p className="text-gray-700">{a.formatted_address}</p>

                            {a.rating != null && (
                                <p className="text-sm text-yellow-600">
                                    ⭐ {a.rating.toFixed(1)}{" "}
                                    <span className="text-gray-500">
                                        ({a.user_ratings_total} reviews)
                                    </span>
                                </p>
                            )}

                            {a.opening_hours && (
                                <div className="mt-1">
                                    <strong>Hours :</strong>
                                    <ul className="text-sm">
                                        {a.opening_hours.weekday_text.map((d, i) => (
                                            <li key={i}>{d}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="mt-3">
                                <strong>Contact :</strong>
                            

                                {a.formatted_phone_number && (
                                    <p>📞 {a.formatted_phone_number}</p>
                                )}

                                {a.website && (
                                    <p>
                                        🌐{" "}
                                        <a
                                            href={a.website}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 underline"
                                        >
                                            Website
                                        </a>
                                    </p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="italic text-gray-500">No artisan found.</p>
            )}
            <button
                type="button"
                onClick={() => navigate("/artisans")}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded transition-colors duration-150 cursor-pointer mt-5"
            >
                ← Back to artisan list
            </button>
        </div>
    );
}
