import { useEffect, useState } from "react";
import { UserData, getUsers } from "../../api/userService";
import { User } from "../../../../backend/src/modules/Users/entities/user.entity";

interface ChatSidebarProps {
  onSelect: (chat: { type: 'general' | 'private' | 'group', targetId?: string }) => void;
  user: User | null;
  onlineUsers: string[];
}

export default function ChatSidebar({ onSelect, user, onlineUsers }: ChatSidebarProps) {
  const [friends, setFriends] = useState<UserData[]>([]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getUsers();
        setFriends(users);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    }
    fetchUsers();
  }, []);

  const mockGroups = [
    { id: 'g1', name: 'Sport' },
    { id: 'g2', name: 'Cinéma' },
  ];

  return (
    <div className="w-64 bg-[#4A93C9] p-4 space-y-4 overflow-y-auto">
      <h2 className="font-bold text-lg">Messagerie</h2>
      <button onClick={() => onSelect({ type: 'general' })} className="block w-full text-left px-2 py-1 hover:bg-gray-200 rounded">
       📢 Général
      </button>

      <div>
        <h3 className="text-sm font-semibold mt-4">👥 Amis</h3>
        {friends
          .filter(friend => friend.id !== user?.id)
          .map(friend => (
            <button
              key={friend.id}
              onClick={() => onSelect({ type: 'private', targetId: friend.id })}
              className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-gray-200 rounded"
            >
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                onlineUsers.includes(friend.id) ? '	bg-lime-500' : 'bg-gray-400'
              }`}
            />
            {/* {onlineUsers.includes(friend.id) ? '🟢' : '⚪'} */}
            {friend.firstname} {friend.lastname}
          </button>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold mt-4">🧑‍🤝‍🧑 Groupes</h3>
        {mockGroups.map(group => (
          <button
            key={group.id}
            onClick={() => onSelect({ type: 'group', targetId: group.id })}
            className="block w-full text-left px-2 py-1 hover:bg-gray-200 rounded"
          >
            {group.name}
          </button>
        ))}
      </div>
    </div>
  );
}