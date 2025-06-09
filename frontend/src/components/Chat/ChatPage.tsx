import { useState } from "react";
import ChatSidebar from "./ChatSidebar";
import GeneralChatPage from "./GeneralChatPage";
import PrivateChatPage from "./PrivateChatPage";
import GroupChatPage from "./GroupChatPage";
import { useAuth } from "../../context/AuthContext";

export default function ChatPage() {
  const { user } = useAuth();

  const [activeChat, setActiveChat] = useState<{ type: 'general' | 'private' | 'group', targetId?: string }>({ type: 'general' });

  return (
    <div className="flex h-screen">
      <ChatSidebar onSelect={setActiveChat} user={user} />
      <div className="flex-1 border-l">
        {activeChat.type === 'general' && <GeneralChatPage key="general" user={user} />}
        {activeChat.type === 'private' && <PrivateChatPage key={`private-${activeChat.targetId}`} user={user} userId={activeChat.targetId!} />}
        {activeChat.type === 'group' && <GroupChatPage key={`group-${activeChat.targetId}`} user={user} groupId={activeChat.targetId!} />}
      </div>
    </div>
  );
}