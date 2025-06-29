import { ChangeEvent, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProfileSummary, ProfileSummaryDTO } from "../../api/userService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useRef } from "react";
import { getFriends, FriendDTO, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend } from "../../api/friendService";
import apiClient from "../../api/apiClient";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { getCitiesByPostalCode, resolveIris } from "../../api/irisService";

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
    const [removingFriendId, setRemovingFriendId] = useState<string | null>(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [address, setAddress] = useState({
        street: "",
        postalCode: "",
        city: "",
        irisCode: "",
        irisName: "",
    });
    const [addressCities, setAddressCities] = useState<string[]>([]);
    const [addressIrisError, setAddressIrisError] = useState<string>("");
    const [addressLoading, setAddressLoading] = useState(false);

    const loadProfile = async () => {
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

    const refreshFriends = async () => {
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
        const { street, postalCode, city } = address;
        if (street && postalCode.length === 5 && city) {
            resolveIris(street, postalCode, city)
                .then(({ irisCode, irisName }) => {
                    setAddress((prev) => ({ ...prev, irisCode, irisName }));
                    setAddressIrisError("");
                })
                .catch(() => {
                    setAddress((prev) => ({ ...prev, irisCode: "", irisName: "" }));
                    setAddressIrisError("Impossible de trouver le quartier pour cette adresse.");
                });
        } else {
            setAddress((prev) => ({ ...prev, irisCode: "", irisName: "" }));
            setAddressIrisError("");
        }
    }, [address.street, address.postalCode, address.city]);

    const handleRemoveFriend = async (friendId: string) => {
        if (!window.confirm("Are you sure you want to remove this user from your friend list ?")) {
            return;
        }
        setRemovingFriendId(friendId);
        try {
            await removeFriend(friendId);
            toast.success("Friend removed");
            await refreshFriends();
            await loadProfile();
        } catch (error) {
            toast.error("Unable to remove this user : " + error);
        } finally {
            setRemovingFriendId(null);
        }
    }

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

    function handleAddressChange(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setAddress((prev) => ({ ...prev, [name]: value }));

        if (name === "postalCode") {
            setAddress((prev) => ({
                ...prev,
                postalCode: value.replace(/\D/g, ""),
                city: "",
                irisCode: "",
                irisName: "",
            }));
            setAddressCities([]);
            setAddressIrisError("");
        }

        if (name === "city") {
            setAddress((prev) => ({ ...prev, city: value }));
            setAddressIrisError("");
        }

        if (name === "street") {
            setAddress((prev) => ({ ...prev, street: value }));
        }
    }

    async function handlePostalCodeSuggestion() {
        if (address.postalCode.length === 5) {
            try {
                const cities = await getCitiesByPostalCode(address.postalCode);
                setAddressCities(cities);
            } catch {
                setAddressCities([]);
            }
        }
    }

    function handleSelectCity(city: string) {
        setAddress((prev) => ({ ...prev, city }));
        setAddressCities([]);
    }

    return (
        <div className="p-6 w-[40%] mx-auto space-y-6 bg-white rounded-2xl mt-10 shadow">
            <button
                type="button"
                onClick={() => navigate("/homepage")}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded transition-colors duration-150 cursor-pointer"
            >
                {"< Homepage"}
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
                    <button
                        onClick={() => setShowAddressModal(true)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 cursor-pointer"
                    >
                        Modifier mon adresse
                    </button>
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
                            <li 
                                key={item.id}
                                className="border p-2 rounded cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/market/${item.id}`)
                                }}
                            >
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

                                        <button
                                            onClick={() => handleRemoveFriend(friend.id)}
                                            disabled={removingFriendId === friend.id}
                                            className="ml-auto p-1 rounded hover:bg-red-100"
                                        >
                                            <Trash2
                                                size={18}
                                                className="text-red-400 hover:text-red-600 cursor-pointer"
                                            />
                                        </button>
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

            {showAddressModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
                        <h2 className="text-lg font-bold mb-3">Change my address</h2>
                        <p className="text-red-500 text-sm mb-2">
                            Changing neighborhoods will permanently delete all your content related to the old neighborhood!
                        </p>
                        <div className="mb-2">
                            <input
                                name="street"
                                type="text"
                                className="w-full mb-2 border rounded px-2 py-1"
                                placeholder="Street"
                                value={address.street}
                                onChange={handleAddressChange}
                            />
                            <input
                                name="postalCode"
                                type="text"
                                maxLength={5}
                                className="w-full mb-2 border rounded px-2 py-1"
                                placeholder="Postal code"
                                value={address.postalCode}
                                onChange={handleAddressChange}
                                onBlur={handlePostalCodeSuggestion}
                            />
                            <div className="relative">
                                <input
                                    name="city"
                                    type="text"
                                    className="w-full mb-2 border rounded px-2 py-1"
                                    placeholder="City"
                                    value={address.city}
                                    onChange={handleAddressChange}
                                    autoComplete="off"
                                    onFocus={() => setAddressCities(addressCities.length > 0 ? addressCities : [])}
                                />
                                {addressCities.length > 0 && (
                                    <ul className="absolute bg-white border rounded w-full max-h-32 overflow-y-auto shadow">
                                        {addressCities.map((city, idx) => (
                                            <li
                                                key={idx}
                                                className="px-2 py-1 hover:bg-amber-100 cursor-pointer"
                                                onClick={() => handleSelectCity(city)}
                                            >
                                                {city}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            {address.irisName && (
                                <div className="text-sm text-amber-700 italic mb-1">
                                    Neighborhood found : <span className="font-bold">{address.irisName}</span>
                                </div>
                            )}
                            {addressIrisError && (
                                <div className="text-sm text-red-500 italic">{addressIrisError}</div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setShowAddressModal(false)}
                                className="px-3 py-1 rounded border text-gray-700 hover:bg-gray-100 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    setAddressLoading(true);
                                    try {
                                        await apiClient.patch("/users/me/address", {
                                            street: address.street,
                                            postalCode: address.postalCode,
                                            city: address.city,
                                        });
                                        toast.success("Adresse modifiée !");
                                        setShowAddressModal(false);
                                        window.location.reload();
                                    } catch (error) {
                                        toast.error("Error while loading address : " + error);
                                    } finally {
                                        setAddressLoading(false);
                                    }
                                }}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer disabled:opacity-60"
                                disabled={!address.street || address.postalCode.length !== 5 || !address.city || !address.irisCode || !!addressIrisError || addressLoading}
                            >
                                Validate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
