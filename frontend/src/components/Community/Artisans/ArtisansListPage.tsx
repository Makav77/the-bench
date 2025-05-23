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
