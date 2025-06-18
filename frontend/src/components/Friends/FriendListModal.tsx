import { useEffect, useState } from "react";
import { FriendDTO, getFriends } from "../../api/friendService";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FriendsListModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export default function FriendsListModal({ isOpen, onClose, userId }: FriendsListModalProps) {
    const [friends, setFriends] = useState<FriendDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
        setLoading(true);
        getFriends(userId)
            .then((res) => setFriends(res))
            .catch(() => setFriends([]))
            .finally(() => setLoading(false));
        }
    }, [isOpen, userId]);

    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" onClick={onClose}></div>

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-50">
                <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Liste d’amis</h2>
                <button onClick={onClose}>
                    <X className="w-6 h-6 text-gray-600 hover:text-black" />
                </button>
                </div>

                {loading ? (
                    <p className="text-center">Chargement...</p>
                ) : friends.length === 0 ? (
                    <p className="text-center text-gray-500">Aucun ami trouvé</p>
                ) : (
                    <ul className="space-y-4 max-h-[300px] overflow-y-auto">
                        {friends.map((friend) => (
                        <li key={friend.id} className="flex items-center space-x-4">
                            <img
                            src={friend.profilePicture || "/uploads/profile/default.png"}
                            alt={`${friend.firstname} ${friend.lastname}`}
                            className="w-10 h-10 rounded-full object-cover"
                            />
                            <span
                                className="font-medium"
                                onClick={() => navigate(`/users/${friend.id}`)}
                            >
                                {friend.firstname} {friend.lastname}
                            </span>
                        </li>
                        ))}
                    </ul>
                )}
            </div>
        </Dialog>
    );
}
