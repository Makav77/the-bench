import { createContext, useContext, useEffect, useState } from "react";
import socket from "../utils/socket";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(socket);
const OnlineUsersContext = createContext<string[]>([]);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    useEffect(() => {
        const handleConnect = () => {
            if (user?.id) {
                socket.emit("auth", { userId: user.id });
            }
        };

        const handleOnlineUsers = (userIds: string[]) => {
            setOnlineUsers(userIds);
        };

        if (!socket.connected) {
            socket.connect();
            socket.on("connect", handleConnect);
        } else {
            handleConnect();
        }
        socket.on("online-users", handleOnlineUsers);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("online-users", handleOnlineUsers);
            socket.disconnect();
        };
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
        <OnlineUsersContext.Provider value={onlineUsers}>
            {children}
        </OnlineUsersContext.Provider>
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
export const useOnlineUsers = () => useContext(OnlineUsersContext)