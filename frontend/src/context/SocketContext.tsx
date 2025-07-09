import { createContext, useContext, useEffect, useState } from "react";
import chatSocket from "../utils/chatSocket";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(chatSocket);
const OnlineUsersContext = createContext<string[]>([]);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    const handleConnect = () => {
      if (user?.id) {
        chatSocket.emit("auth", { userId: user.id });
      }
    };

    const handleOnlineUsers = (userIds: string[]) => {
      setOnlineUsers(userIds);
    };

    if (!chatSocket.connected) {
      chatSocket.connect();
      chatSocket.on("connect", handleConnect);
    } else {
      handleConnect();
    }
    chatSocket.on("online-users", handleOnlineUsers);

    return () => {
      chatSocket.off("connect", handleConnect);
      chatSocket.off("online-users", handleOnlineUsers);
      chatSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={chatSocket}>
      <OnlineUsersContext.Provider value={onlineUsers}>
        {children}
      </OnlineUsersContext.Provider>
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
export const useOnlineUsers = () => useContext(OnlineUsersContext)