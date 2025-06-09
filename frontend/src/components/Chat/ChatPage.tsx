import { useState } from "react";
import ChatSidebar from "./ChatSidebar";
import GeneralChatPage from "./GeneralChatPage";
import { useAuth } from "../../context/AuthContext";

export default function ChatPage() {
  const { user } = useAuth();

  const [activeChat, setActiveChat] = useState<{ type: 'general' | 'private' | 'group', targetId?: string }>({ type: 'general' });

  return (
    <div className="flex h-screen">
      <ChatSidebar onSelect={setActiveChat} user={user} />
      <div className="flex-1 border-l">
        {activeChat.type === 'general' && <GeneralChatPage user={user} />}
      </div>
    </div>
  );
}