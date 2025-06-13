import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProfileSummary, ProfileSummaryDTO } from "../../api/userService";
import { toast } from "react-toastify";

export default function UserProfilePage() {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<ProfileSummaryDTO | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                if (id) {
                    const data = await getProfileSummary(id);
                    setProfile(data);
                }
            } catch (error) {
                toast.error("Unable to load user profile.");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    if (loading) {
        return <p className="p-6">Loading profile...</p>;
    }
    if (!profile) {
        return <p className="p-6">Profile not found.</p>;
    }

    return (
        <div className="p-6 w-[40%] mx-auto space-y-6 bg-white rounded-2xl mt-10 shadow">
            <button
                onClick={() => navigate(-1)}
                className="text-blue-600 underline cursor-pointer border rounded px-2 py-1 bg-white mb-4"
            >
                ← Back
            </button>

            <div className="flex flex-col items-center space-y-3">
                <img
                    src={profile.profilePictureUrl}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border"
                />
                <h1 className="text-2xl font-bold">{profile.firstname} {profile.lastname}</h1>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-2">Badges</h2>
                {profile.badges.length === 0 ? (
                    <p className="text-gray-600 italic">No badges yet.</p>
                ) : (
                    <ul className="flex flex-wrap gap-2">
                        {profile.badges.map((badge, index) => (
                            <li key={index} className="px-3 py-1 bg-yellow-200 rounded-full text-sm font-medium">
                                {badge}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-2">Participated Events</h2>
                {profile.events.length === 0 ? (
                    <p className="text-gray-600 italic">No event participation yet.</p>
                ) : (
                    <ul className="space-y-1">
                        {profile.events.map(event => (
                            <li key={event.id} className="border-b py-1">
                                {event.name} - {new Date(event.startDate).toLocaleDateString()}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-2">Participated Challenges</h2>
                {profile.challenges.length === 0 ? (
                    <p className="text-gray-600 italic">No challenge participation yet.</p>
                ) : (
                    <ul className="space-y-1">
                        {profile.challenges.map(challenge => (
                            <li key={challenge.id} className="border-b py-1">
                                {challenge.title} - {new Date(challenge.startDate).toLocaleDateString()}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-2">Market Items</h2>
                {profile.marketItems.length === 0 ? (
                    <p className="text-gray-600 italic">No items currently online.</p>
                ) : (
                    <ul className="space-y-2">
                        {profile.marketItems.map(item => (
                            <li key={item.id} className="border p-2 rounded">
                                <p className="font-semibold">{item.title}</p>
                                <p className="text-sm text-gray-500">
                                    Last update: {new Date(item.updatedAt).toLocaleDateString()}
                                </p>
                                {item.images[0] && (
                                    <img
                                        src={item.images[0]}
                                        alt="Market item"
                                        className="w-32 h-32 object-cover mt-2 rounded"
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
