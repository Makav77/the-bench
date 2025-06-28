import { useNavigate } from "react-router-dom";

const CATEGORIES = [
    "plumber",
    "electrician",
    "carpenter",
    "painter",
    "mason",
    "gardener",
    "heating engineer",
    "tiler",
    "locksmith",
    "glazier",
];

function ArtisansListPage() {
    const navigate = useNavigate();

    return (
        <div className="p-6 w-[30%] mx-auto">
                <button
                    type="button"
                    onClick={() => navigate("/community")}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded transition-colors duration-150 cursor-pointer mb-5"
                >
                    ← Back to community
                </button>
            <h1 className="text-3xl font-bold mb-4">Artisans</h1>
            <ul className="grid grid-cols-2 gap-4">
                {CATEGORIES.map((c) => (
                    <li
                        key={c}
                        onClick={() => navigate(`/artisans/${c}`)}
                        className="p-4 border rounded-2xl cursor-pointer hover:shadow transition bg-white hover:bg-gray-200"
                    >
                        <strong className="capitalize">{c}</strong>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ArtisansListPage;
