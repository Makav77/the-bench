import { ChangeEvent, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProfileSummary, ProfileSummaryDTO } from "../../api/userService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useRef } from "react";
import { getFriends, FriendDTO, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend } from "../../api/friendService";
import apiClient from "../../api/apiClient";
import { Link } from "react-router-dom";

export default function UserProfilePage() {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<ProfileSummaryDTO | null>(null);
    const { user } = useAuth();
    const isOwnProfile = user && user.id === id;
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [friendActionLoading, setFriendActionLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [fileName, setFileName] = useState<string>("");
    const [friends, setFriends] = useState<FriendDTO[]>([]);
    const [showFriendsModal, setShowFriendsModal] = useState<boolean>(false);

    const loadProfile = async() => {
        if (!id) {
            return;
        }
        setLoading(true);
        try {
            const data = await getProfileSummary(id);
            setProfile(data);
        } catch (error) {
            toast.error("Unable to load user profile : " + error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, [id]);

    const refreshFriends = async() => {
        if (id && isOwnProfile) {
            try {
                const data = await getFriends(id);
                setFriends(data);
            } catch (error) {
                toast.error("Unable to load friends list : " + error);
            }
        }
    };

    useEffect(() => {
        refreshFriends();
    }, [id, isOwnProfile]);

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

    useEffect(() => {
        if (isOwnProfile && id) {
            (async () => {
                try {
                    const data = await getFriends(id);
                    setFriends(data);
                } catch (error) {
                    toast.error("Unable to load friends list: " + error);
                }
            })();
        }
    }, [id, isOwnProfile]);

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

                {!isOwnProfile && (
                    <div className="mt-2">
                        {profile.isFriend ? (
                            <button
                                onClick={async () => {
                                    setFriendActionLoading(true);
                                    try {
                                        await removeFriend(profile.id);
                                        toast.success("Friend removed");
                                        await loadProfile();
                                    } catch (error) {
                                        toast.error("Unable to remove friend : " + error);
                                    } finally {
                                        setFriendActionLoading(false);
                                    }
                                }}
                                disabled={friendActionLoading}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 cursor-pointer"
                            >
                                {friendActionLoading ? "Removing..." : "Removed from friend"}
                            </button>
                        ) : profile.requestSent ? (
                            <button
                                disabled
                                className="px-3 py-1 bg-gray-400 text-white rounded cursor-not-allowed"
                            >
                                Request sent
                            </button>
                        ) : profile.requestReceived ? (
                            <div className="flex space-x-2">
                                <button
                                    onClick={async () => {
                                        setFriendActionLoading(true);
                                        try {
                                            await acceptFriendRequest(profile.id);
                                            toast.success("Request accepted");
                                            await loadProfile();
                                            await refreshFriends();
                                        } catch (error) {
                                            toast.error("Unable to accept friend request : " + error);
                                        } finally {
                                            setFriendActionLoading(false);
                                        }
                                    }}
                                    disabled={friendActionLoading}
                                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 cursor-pointer"
                                >
                                    {friendActionLoading ? "Acceptation..." : "Accepted"}
                                </button>
                                <button
                                    onClick={async () => {
                                        setFriendActionLoading(true);
                                        try {
                                            await rejectFriendRequest(profile.id);
                                            toast.success("Request rejected");
                                            await loadProfile();
                                        } catch (error) {
                                            toast.error("Unable to reject friend request : " + error);
                                        } finally {
                                            setFriendActionLoading(false);
                                        }
                                    }}
                                    disabled={friendActionLoading}
                                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 cursor-pointer"
                                >
                                    {friendActionLoading ? "Reject..." : "Rejected"}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={async () => {
                                    setFriendActionLoading(true);
                                    try {
                                        await sendFriendRequest(profile.id);
                                        toast.success("Request send");
                                        await loadProfile();
                                    } catch (error) {
                                        toast.error("Unable to send friend request " + error);
                                    } finally {
                                        setFriendActionLoading(false);
                                    }
                                }}
                                disabled={friendActionLoading}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
                            >
                                {friendActionLoading ? "Sending..." : "Add friend"}
                            </button>
                        )}
                    </div>
                )}

                {isOwnProfile && (
                    <div className="flex align-center items-center gap-4">
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                        >
                            Change my profile picture
                        </button>

                        <button
                            onClick={() => setShowFriendsModal(true)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer"
                        >
                            Show friends
                        </button>
                    </div>
                )}
            </div>

            <div>
                {isOwnProfile && (
                    <div className="text-xl font-semibold text-blue-700">
                        Points: {profile.points}
                    </div>
                )}

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

            {showFriendsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
                        <h2 className="text-lg font-bold mb-4 text-center">
                            Friends list
                            <span className="ml-2 text-sm text-gray-500">
                                ({friends.length})
                            </span>
                        </h2>

                        {friends.length === 0 ? (
                            <p className="text-center text-gray-600 italic">No friends right now</p>
                        ) : (
                            <ul className="space-y-3 max-h-96 overflow-y-auto">
                                {friends.map(friend => (
                                    <li key={friend.id} className="flex items-center space-x-3">
                                        <img
                                            src={friend.profilePicture}
                                            alt={`${friend.firstname} ${friend.lastname}`}
                                            className="w-10 h-10 rounded-full object-cover border"
                                        />
                                        <Link
                                            to={`/profile/${friend.id}`}
                                            className="font-medium cursor-pointer hover:text-gray-800"
                                            onClick={() => setShowFriendsModal(false)}
                                        >
                                            {friend.firstname} {friend.lastname}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setShowFriendsModal(false)}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
