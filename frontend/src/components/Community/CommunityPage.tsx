import { useNavigate } from 'react-router-dom';

const sections = [
    { label: 'Gallery', path: '/gallery' },
    { label: 'Survey', path: '/survey' },
    { label: 'Challenge', path: '/challenge' },
    { label: 'Calendar', path: '/calendar' },
    { label: 'Artisans', path: '/artisans' },
    { label: 'Journal', path: '/journal' },
];

export default function CommunityPage() {
    const navigate = useNavigate();

    return (
        <div className="p-6 w-[40%] mx-auto">
            <h1 className="text-3xl font-bold mb-8">Community</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {sections.map(({ label, path }) => (
                <button
                    key={path}
                    onClick={() => navigate(path)}
                    className="p-6 bg-white rounded-lg shadow hover:shadow-md transition flex items-center justify-center font-semibold text-lg cursor-pointer hover:bg-gray-200"
                >
                    {label}
                </button>
                ))}
            </div>
        </div>
    );
}
