import { useState } from "react";
import ChatSidebar from "./ChatSidebar";
import GeneralChatPage from "./GeneralChatPage";
import PrivateChatPage from "./PrivateChatPage";
import GroupChatPage from "./GroupChatPage";
import CreateGroupPage from "./CreateGroupPage";
import { useAuth } from "../../context/AuthContext";
import { useOnlineUsers } from "../../context/SocketContext";

export default function ChatPage() {
  const { user } = useAuth();
  const onlineUsers = useOnlineUsers();
  const [refreshSidebar, setRefreshSidebar] = useState(0);
  const handleGroupCreated = () => {
    setRefreshSidebar(c => c + 1);
  };

  const [activeChat, setActiveChat] = useState<{ type: 'general' | 'private' | 'group' | 'create-group', targetId?: string, groupName?: string }>({ type: 'general' });


  return (
    <div className="flex h-screen">
      <ChatSidebar onSelect={setActiveChat} user={user} onlineUsers={onlineUsers} refreshTrigger={refreshSidebar} />
      <div className="flex-1 border-l">
        {activeChat.type === 'general' && <GeneralChatPage key="general" user={user} />}
        {activeChat.type === 'private' && <PrivateChatPage key={`private-${activeChat.targetId}`} user={user} userId={activeChat.targetId!} />}
        {activeChat.type === 'group' && <GroupChatPage onLeave={() => { setActiveChat({ type: 'general' }); handleGroupCreated()}} key={`group-${activeChat.targetId}`} user={user} groupId={activeChat.targetId!} groupName={activeChat.groupName?activeChat.groupName:""} />}
        {activeChat.type === 'create-group' && <CreateGroupPage user={user} handleGroupCreated={handleGroupCreated} />}
      </div>
    </div>
  );
}