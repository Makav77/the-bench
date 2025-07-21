import { useState, useEffect } from "react";
import { User } from "../../../../backend/src/modules/Users/entities/user.entity";
import { UserData, getUsers } from "../../api/userService";
import { createGroup } from "../../api/chatService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

interface Props {
  user: User | null;
  onCancel?: () => void;
  handleGroupCreated?: () => void;
}

export default function CreateGroupPage({ user, onCancel, handleGroupCreated }: Props) {
  const { t } = useTranslation("Chat/CreateGroup");
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
      toast.success(t("groupCreated"));
      handleGroupCreated?.();
    } catch (err) {
      console.error("Erreur création groupe :", err);
      toast.error(t("groupCreationError"));
    }
  };

  return (
    <div className="p-4 max-sm:p-6 max-sm:rounded-2xl">
      <h1 className="text-xl font-bold mb-4 max-sm:text-2xl max-sm:text-center">{t("createGroup")}</h1>
      <input
        className="border px-2 py-1 w-full mb-4 max-sm:py-4 max-sm:text-lg"
        placeholder={t("groupName")}
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <h2 className="font-semibold mb-2 max-sm:text-lg">{t("inviteFriends")}</h2>
      <div className="flex flex-col gap-1 max-h-48 overflow-y-auto max-sm:text-lg">
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
        {onCancel && (
          <button
            className="bg-gray-300 text-black px-4 py-1 rounded cursor-pointer max-sm:w-full max-sm:text-lg max-sm:py-4"
            onClick={onCancel}
          >
            {t("cancel")}
          </button>
        )}
        <button
          className="bg-blue-500 text-white px-4 py-1 rounded cursor-pointer max-sm:w-full max-sm:text-lg max-sm:py-4"
          onClick={handleSubmit}
        >
          {t("create")}
        </button>
      </div>
    </div>
  );
}
