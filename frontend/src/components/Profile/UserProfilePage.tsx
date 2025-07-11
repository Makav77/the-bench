import { ChangeEvent, useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProfileSummary, ProfileSummaryDTO, deleteMyAccount } from "../../api/userService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { getFriends, FriendDTO, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, getPendingFriendRequests, cancelFriendRequest } from "../../api/friendService";
import apiClient from "../../api/apiClient";
import { Trash2 } from "lucide-react";
import { getCitiesByPostalCode, resolveIris } from "../../api/irisService";
import { useTranslation } from "react-i18next";

export default function UserProfilePage() {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<ProfileSummaryDTO | null>(null);
    const { user, logout } = useAuth();
    const isOwnProfile = user && user.id === id;
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation("Profile/UserProfilePage");
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
    const [pendingFriendRequests, setPendingFriendRequests] = useState<FriendDTO[]>([]);

    const loadProfile = async () => {
        if (!id) {
            return;
        }
        setLoading(true);
        try {
            const data = await getProfileSummary(id);
            setProfile(data);
        } catch {
            toast.error(t("toastUnableLoadProfile"));
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
                const pendingFriendRequests = await getPendingFriendRequests(id);
                setPendingFriendRequests(pendingFriendRequests);
            } catch {
                toast.error(t("toastUnableLoadFriendList"));
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
        if (!window.confirm(t("confirmAlert"))) {
            return;
        }
        setRemovingFriendId(friendId);
        try {
            await removeFriend(friendId);
            toast.success(t("toastFriendRemoved"));
            await refreshFriends();
            await loadProfile();
        } catch {
            toast.error(t("toastFriendRemovedError"));
        } finally {
            setRemovingFriendId(null);
        }
    };

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
            toast.success(t("toastProfilPicUpdated"));
            window.location.reload();
        } catch {
            toast.error(t("toastProfilPicUpdatedError"));
        }
    };

    if (loading) {
        return <p className="p-6">{t("loading")}</p>;
    }

    if (!profile) {
        return <p className="p-6">{t("profileNotFound")}</p>;
    }

    function handleAddressChange(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;

        if (name === "street" || name === "city") {
            setAddress((prev) => ({ ...prev, [name]: value.trimStart() })); // 😁 Ajout trimStart
        } else if (name === "postalCode") {
            setAddress((prev) => ({
                ...prev,
                postalCode: value.replace(/\D/g, ""),
                city: "",
                irisCode: "",
                irisName: "",
            }));
            setAddressCities([]);
            setAddressIrisError("");
        } else {
            setAddress((prev) => ({ ...prev, [name]: value }));
        }

        if (name === "city") {
            setAddressIrisError("");
        }
    }

    async function handleDeleteAccount() {
        if (!window.confirm(t("confirmAlertDeleteAccount"))) {
            return;
        }

        try {
            await deleteMyAccount(user!.id);
        } catch  {
            toast.error(t("deletingAccountError"));
        } finally {
            logout();
            localStorage.removeItem('accessToken');
            navigate("/");
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
        <div className="p-6 w-[40%] max-sm:w-[97vw] max-sm:p-2 max-sm:rounded-lg mx-auto space-y-6 max-sm:space-y-3 bg-white rounded-2xl mt-10 shadow">
            <button
                type="button"
                onClick={() => navigate("/homepage")}
                className="bg-gray-300 hover:bg-gray-300 sm:bg-gray-200 text-gray-700 font-semibold py-3 sm:py-1 px-4 rounded transition-colors duration-150 cursor-pointer max-sm:w-full"
            >
                {t("homepageButton")}
            </button>
            <div className="flex flex-col items-center space-y-3">
                {profile.profilePictureUrl ? (
                    <img
                        src={profile.profilePictureUrl ? `${profile.profilePictureUrl}?t=${Date.now()}` : "/uploads/profile/default.png"}
                        alt={t("profilePicture")}
                        className="w-64 h-64 max-sm:w-48 max-sm:h-48 rounded-full object-cover border"
                    />
                ) : (
                    <div className="w-32 h-32 max-sm:w-24 max-sm:h-24 rounded-full border flex items-center justify-center bg-gray-100 text-gray-500">
                        {t("noImage")}
                    </div>
                )}

                <h1 className="text-2xl max-sm:text-lg font-bold">
                    {profile.firstname} {profile.lastname}
                </h1>

                {!isOwnProfile && (
                    <div className="flex align-center items-center gap-4 max-sm:flex-col max-sm:w-3/4 max-sm:gap-2">
                        {profile.isFriend ? (
                            <button
                                onClick={async () => {
                                    setFriendActionLoading(true);
                                    try {
                                        await removeFriend(profile.id);
                                        toast.success(t("toastFriendRemoved"));
                                        await loadProfile();
                                    } catch {
                                        toast.error(t("toastFriendRemovedError"));
                                    } finally {
                                        setFriendActionLoading(false);
                                    }
                                }}
                                disabled={friendActionLoading}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 cursor-pointer max-sm:w-full max-sm:text-sm"
                            >
                                {friendActionLoading ? t("removing") : t("removingFriend")}
                            </button>
                        ) : profile.requestSent ? (
                                <div className="flex flex-col gap-2 items-center max-sm:w-full">
                                    <button
                                        disabled
                                        className="px-3 py-3 sm:py-1 bg-gray-400 text-white rounded cursor-not-allowed max-sm:w-full max-sm:text-sm"
                                    >
                                        {t("requestSent")}
                                    </button>

                                    <button
                                        onClick={async () => {
                                            setFriendActionLoading(true);
                                            try {
                                                await cancelFriendRequest(profile.id);
                                                toast.success(t("toastRequestCanceled"));
                                                await loadProfile();
                                            } catch {
                                                toast.error(t("toastRequestCanceledError"));
                                            } finally {
                                                setFriendActionLoading(false);
                                            }
                                        }}
                                        disabled={friendActionLoading}
                                        className="px-3 py-3 sm:py-1 bg-red-400 text-white rounded hover:bg-red-500 cursor-pointer max-sm:w-full max-sm:text-sm"
                                    >
                                        {friendActionLoading ? t("cancelling"): t("cancelRequest")}
                                    </button>
                                </div>
                        ) : profile.requestReceived ? (
                            <div className="flex space-x-2 max-sm:flex-col max-sm:gap-2 max-sm:w-full">
                                <button
                                    onClick={async () => {
                                        setFriendActionLoading(true);
                                        try {
                                            await acceptFriendRequest(profile.id);
                                            toast.success(t("toastRequestAccepted"));
                                            await loadProfile();
                                            await refreshFriends();
                                        } catch {
                                            toast.error(t("toastRequestAcceptedError"));
                                        } finally {
                                            setFriendActionLoading(false);
                                        }
                                    }}
                                    disabled={friendActionLoading}
                                    className="px-3 py-3 sm:py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 cursor-pointer max-sm:w-full max-sm:text-sm"
                                >
                                    {friendActionLoading ? t("acceptation") : t("accepted")}
                                </button>
                                <button
                                    onClick={async () => {
                                        setFriendActionLoading(true);
                                        try {
                                            await rejectFriendRequest(profile.id);
                                            toast.success(t("toastRequestRejected"));
                                            await loadProfile();
                                        } catch {
                                            toast.error(t("toastRequestRejectedError"));
                                        } finally {
                                            setFriendActionLoading(false);
                                        }
                                    }}
                                    disabled={friendActionLoading}
                                    className="px-3 py-3 sm:py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 cursor-pointer max-sm:w-full max-sm:text-sm"
                                >
                                    {friendActionLoading ? t("reject") : t("rejected")}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={async () => {
                                    setFriendActionLoading(true);
                                    try {
                                        await sendFriendRequest(profile.id);
                                        toast.success(t("toastRequestSend"));
                                        await loadProfile();
                                    } catch {
                                        toast.error(t("toastRequestSendError"));
                                    } finally {
                                        setFriendActionLoading(false);
                                    }
                                }}
                                disabled={friendActionLoading}
                                className="px-3 py-3 sm:py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 cursor-pointer max-sm:w-3/4 max-sm:text-sm mx-auto"
                            >
                                {friendActionLoading ? t("sending") : t("addFriend")}
                            </button>
                        )}
                    </div>
                )}

                {isOwnProfile && (
                    <div className="flex align-center items-center gap-4 max-sm:flex-col max-sm:w-3/4 max-sm:gap-2">
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-3 py-3 sm:py-1 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer max-sm:w-full max-sm:text-sm"
                        >
                            {t("changePicture")}
                        </button>

                        <button
                            onClick={() => setShowAddressModal(true)}
                            className="px-3 py-3 sm:py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 cursor-pointer max-sm:w-full max-sm:text-sm"
                        >
                            {t("changeAddress")}
                        </button>

                        <button
                            onClick={() => setShowFriendsModal(true)}
                            className="px-3 py-3 sm:py-1 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer max-sm:w-full max-sm:text-sm"
                        >
                            {t("showFriends")}
                        </button>

                        <button
                            onClick={handleDeleteAccount}
                            className="px-3 py-3 sm:py-1 bg-red-700 text-white rounded hover:bg-red-800 cursor-pointer max-sm:w-full max-sm:text-sm"
                        >
                            {t("deleteAccount")}
                        </button>
                    </div>
                )}
            </div>

            <div>
                {isOwnProfile && (
                    <div className="text-xl max-sm:text-base font-semibold text-blue-700">
                        {t("points")} {profile.points}
                    </div>
                )}

                <h2 className="text-xl max-sm:text-base font-semibold mb-2">
                    {t("badges")}
                </h2>

                {profile.badges.length === 0 ? (
                    <p className="text-gray-600 italic">
                        {t("noBadges")}
                    </p>
                ) : (
                    <ul className="flex flex-wrap gap-2">
                        {profile.badges.map(badge => (
                            <li 
                                key={badge.id}
                                className="px-3 py-1 bg-yellow-200 rounded-full text-sm font-medium flex items-center gap-2"
                            >
                                <img
                                    src={badge.imageUrl}
                                    alt="badge"
                                    className="w-10 h-10 max-sm:w-7 max-sm:h-7 inline-block rounded-full"
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div>
                <h2 className="text-xl max-sm:text-base font-semibold mb-2">
                    {t("participatedEvent")}
                </h2>

                {profile.events.length === 0 ? (
                    <p className="text-gray-600 italic">{t("noEventDone")}</p>
                ) : (
                    <ul className="space-y-1 max-sm:text-sm">
                        {profile.events.map(event => (
                            <li key={event.id} className="border-b py-1">
                                {event.name} - {new Date(event.startDate).toLocaleDateString()}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div>
                <h2 className="text-xl max-sm:text-base font-semibold mb-2">
                    {t("participatedChallenge")}
                </h2>

                {profile.challenges.length === 0 ? (
                    <p className="text-gray-600 italic">{t("noChallengeDone")}</p>
                ) : (
                    <ul className="space-y-1 max-sm:text-sm">
                        {profile.challenges.map(challenge => (
                            <li key={challenge.id} className="border-b py-1">
                                {challenge.title} - {new Date(challenge.startDate).toLocaleDateString()}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div>
                <h2 className="text-xl max-sm:text-base font-semibold mb-2">
                    {t("marketItem")}
                </h2>

                {profile.marketItems.length === 0 ? (
                    <p className="text-gray-600 italic">{t("noItemOnSell")}</p>
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
                                    {t("lastUpdate")} {new Date(item.updatedAt).toLocaleDateString()}
                                </p>
                                {item.images[0] && (
                                    <img
                                        src={item.images[0]}
                                        alt="Market item"
                                        className="w-32 h-32 max-sm:w-20 max-sm:h-20 object-cover mt-2 rounded"
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
                    <div className="bg-white p-6 max-sm:p-2 rounded-lg shadow-lg w-[90%] max-w-md">
                        {preview && (
                            <div className="mb-4 flex flex-col items-center justify-center">
                                <p className="text-sm text-gray-500 mb-1">{t("preview")}</p>
                                <img
                                    src={preview}
                                    alt="Aperçu"
                                    className="w-32 h-32 max-sm:w-60 max-sm:h-60 object-cover rounded-full border mx-auto"
                                />
                            </div>
                        )}

                        <h2 className="text-lg font-bold mb-4 text-center">
                            {t("changePicture")}
                        </h2>

                        <div className="mb-4 flex justify-center">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded cursor-pointer max-sm:w-3/5 max-sm:text-sm max-sm:py-3"
                            >
                                {t("selectFile")}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleFileChange}
                            />
                        </div>

                        {fileName && (
                            <p className="text-sm text-gray-600 mt-2 text-center">
                                {t("selected")} <strong>{fileName}</strong>
                            </p>
                        )}

                        <div className="flex justify-end space-x-3 max-sm:flex-col max-sm:gap-3 max-sm:space-x-0 mt-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-3 py-1 rounded border text-gray-700 hover:bg-gray-100 cursor-pointer max-sm:text-lg max-sm:py-3 max-sm:w-full"
                            >
                                {t("cancel")}
                            </button>
                            <button
                                onClick={() => {
                                    handleUpload();
                                    setShowModal(false);
                                }}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer max-sm:text-lg max-sm:py-3 max-sm:w-full"
                            >
                                {t("upload")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showFriendsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
                    <div className="bg-white p-6 max-sm:p-2 rounded-lg shadow-lg w-[90%] max-w-md">
                        <h2 className="text-lg font-bold mb-4 text-center">
                            {t("friendsList")}
                            <span className="ml-2 text-sm text-gray-500">
                                ({friends.length})
                            </span>
                        </h2>

                        {isOwnProfile && pendingFriendRequests.length > 0 && (
                            <>
                                <div className="mb-2 font-semibold text-amber-700">
                                    {t("pendingRequests")}
                                </div>
                                <ul className="space-y-3 mb-4">
                                    {pendingFriendRequests.map(requester => (
                                        <li key={requester.id} className="flex items-center space-x-3">
                                            <img
                                                src={requester.profilePicture}
                                                alt={`${requester.firstname} ${requester.lastname}`}
                                                className="w-10 h-10 max-sm:w-7 max-sm:h-7 rounded-full object-cover border"
                                            />
                                            <Link
                                                to={`/profile/${requester.id}`}
                                                className="font-medium cursor-pointer hover:text-gray-800"
                                                onClick={() => setShowFriendsModal(false)}
                                            >
                                                {requester.firstname} {requester.lastname}
                                            </Link>
                                            <button
                                                className="ml-auto p-1 rounded bg-green-500 text-white hover:bg-green-600 px-2 py-1 cursor-pointer"
                                                onClick={async () => {
                                                    await acceptFriendRequest(requester.id);
                                                    toast.success(t("toastRequestAccepted"));
                                                    await refreshFriends();
                                                    await loadProfile();
                                                }}
                                            >
                                                {t("acceptRequest")}
                                            </button>

                                            <button
                                                className="p-1 rounded bg-red-500 text-white hover:bg-red-600 px-2 py-1 cursor-pointer"
                                                onClick={async () => {
                                                    await rejectFriendRequest(requester.id);
                                                    toast.success(t("toastRequestRejected"));
                                                    await refreshFriends();
                                                    await loadProfile();
                                                }}
                                            >
                                                {t("rejectRequest")}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                        <div className="border-t-1 mb-4" />

                        {friends.length === 0 ? (
                            <p className="text-center text-gray-600 italic">{t("noFriends")}</p>
                        ) : (
                            <div>
                                <p className="mb-2 font-semibold text-amber-700">{t("friends")}</p>
                                <ul className="space-y-3 max-h-96 overflow-y-auto">
                                    {friends.map(friend => (
                                        <li key={friend.id} className="flex items-center space-x-3">
                                            <img
                                                src={friend.profilePicture}
                                                alt={`${friend.firstname} ${friend.lastname}`}
                                                className="w-10 h-10 max-sm:w-7 max-sm:h-7 rounded-full object-cover border"
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
                            </div>
                        )}

                        <div className="flex justify-end mt-4 max-sm:flex-col max-sm:gap-3">
                            <button
                                onClick={() => setShowFriendsModal(false)}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer max-sm:text-lg max-sm:py-3 max-sm:w-full"
                            >
                                {t("close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAddressModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
                    <div className="bg-white p-6 max-sm:p-2 rounded-lg shadow-lg w-[90%] max-w-md">
                        <h2 className="text-lg font-bold mb-3">{t("changeAddress")}</h2>

                        <p className="text-red-500 text-sm mb-2">
                            {t("warningChangeAddress")}
                        </p>

                        <div className="mb-2">
                            <input
                                name="street"
                                type="text"
                                className="w-full mb-2 border rounded px-2 py-1 text-xl sm:text-base h-12 sm:h-8"
                                placeholder={t("street")}
                                value={address.street}
                                onChange={handleAddressChange}
                            />

                            <input
                                name="postalCode"
                                type="text"
                                maxLength={5}
                                className="w-full mb-2 border rounded px-2 py-1 text-xl sm:text-base h-12 sm:h-8"
                                placeholder={t("postalCode")}
                                value={address.postalCode}
                                onChange={handleAddressChange}
                                onBlur={handlePostalCodeSuggestion}
                            />

                            <div className="relative">
                                <input
                                    name="city"
                                    type="text"
                                    className="w-full mb-2 border rounded px-2 py-1 text-xl sm:text-base h-12 sm:h-8"
                                    placeholder={t("city")}
                                    value={address.city}
                                    onChange={handleAddressChange}
                                    readOnly
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
                                    {t("neighborhoodFound")} <span className="font-bold">{address.irisName}</span>
                                </div>
                            )}

                            {addressIrisError && (
                                <div className="text-sm text-red-500 italic">{addressIrisError}</div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 mt-4 max-sm:flex-col max-sm:gap-3">
                            <button
                                onClick={() => setShowAddressModal(false)}
                                className="px-3 py-1 rounded border text-gray-700 hover:bg-gray-100 cursor-pointer max-sm:text-lg max-sm:py-3 max-sm:w-full"
                            >
                                {t("cancel")}
                            </button>

                            <button
                                onClick={async () => {
                                    setAddressLoading(true);
                                    try {
                                        await apiClient.patch("/users/me/address", {
                                            street: address.street.trim(),
                                            postalCode: address.postalCode,
                                            city: address.city.trim(),
                                        });
                                        toast.success(t("toastAddressUpdated"));
                                        setShowAddressModal(false);
                                        window.location.reload();
                                    } catch {
                                        toast.error(t("toastErrorLoadingAddress"));
                                    } finally {
                                        setAddressLoading(false);
                                    }
                                }}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer disabled:opacity-60 max-sm:text-lg max-sm:py-3 max-sm:w-full"
                                disabled={!address.street || address.postalCode.length !== 5 || !address.city || !address.irisCode || !!addressIrisError || addressLoading}
                            >
                                {t("validate")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
