import { ChangeEvent, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProfileSummary, ProfileSummaryDTO } from "../../api/userService";
import { toast } from "react-toastify";
import { useRef } from "react";
import apiClient from "../../api/apiClient";

export default function UserProfilePage() {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<ProfileSummaryDTO | null>(null);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [fileName, setFileName] = useState<string>("");

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                if (id) {
                    const data = await getProfileSummary(id);
                    setProfile(data);
                }
            } catch (error) {
                toast.error("Unable to load user profile : " + error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileName(selectedFile.name);
            setPreview(URL.createObjectURL(selectedFile));
        } else {
            setFile(null);
            setFileName("");
            setPreview(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            await apiClient.post("/users/upload-profile", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });
            toast.success("Profile pic updated.");
            window.location.reload();
        } catch (error) {
            toast.error("Unable to update profile pic : " + error);
        }
    };

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
                    {profile.profilePictureUrl ? (
                        <img
                            src={profile.profilePictureUrl ? `${profile.profilePictureUrl}?t=${Date.now()}` : "/uploads/profile/default.png"}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border"
                        />
                    ) : (
                        <div className="w-32 h-32 rounded-full border flex items-center justify-center bg-gray-100 text-gray-500">
                            No image available
                        </div>
                    )}
                <h1 className="text-2xl font-bold">{profile.firstname} {profile.lastname}</h1>

                <div className="flex flex-col items-center space-y-2">
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                    >
                        Change my profile picture
                    </button>
                </div>
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

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    {preview && (
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-1">Preview :</p>
                            <img
                                src={preview}
                                alt="Aperçu"
                                className="w-32 h-32 object-cover rounded-full border mx-auto mr-5"
                            />
                        </div>
                    )}
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
                        <h2 className="text-lg font-bold mb-4">Change my profile picture</h2>

                        <div className="mb-4 text-center">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded cursor-pointer"
                            >
                                Select file
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleFileChange}
                            />
                            {fileName && (
                                <p className="text-sm text-gray-600 mt-2">Selected: <strong>{fileName}</strong></p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-3 py-1 rounded border text-gray-700 hover:bg-gray-100 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleUpload();
                                    setShowModal(false);
                                }}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
