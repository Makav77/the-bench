import { useState, useEffect } from "react";
import { User } from "../../../../backend/src/modules/Users/entities/user.entity";
import { UserData, getUsers } from "../../api/userService";
import { createGroup } from "../../api/chatService";

interface Props {
  user: User | null;
  onCancel?: () => void;
  handleGroupCreated?: () => void;
}

export default function CreateGroupPage({ user, onCancel, handleGroupCreated }: Props) {
  const [groupName, setGroupName] = useState("");
  const [friends, setFriends] = useState<UserData[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(user ? [user.id] : []);

  useEffect(() => {
    const fetchFriends = async () => {
      const users: Array<UserData> = await getUsers();
      setFriends(users.filter(f => f.id !== user?.id));
    };
    fetchFriends();
  }, [user]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!groupName.trim() || selectedIds.length === 0) return;
    try {
      await createGroup({ name: groupName, members: selectedIds });
      alert("Groupe créé !");
      handleGroupCreated?.();
    } catch (err) {
      console.error("Erreur création groupe :", err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Créer un Groupe</h1>

      <input
        className="border px-2 py-1 w-full mb-4"
        placeholder="Nom du groupe"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />

      <h2 className="font-semibold mb-2">Inviter des amis</h2>
      <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
        {friends.map(friend => (
          <label key={friend.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedIds.includes(friend.id)}
              onChange={() => toggleSelection(friend.id)}
            />
            {friend.firstname} {friend.lastname}
          </label>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          className="bg-blue-500 text-white px-4 py-1 rounded cursor-pointer"
          onClick={handleSubmit}
        >
          Créer
        </button>
        {onCancel && (
          <button
            className="bg-gray-300 text-black px-4 py-1 rounded cursor-pointer"
            onClick={onCancel}
          >
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}
