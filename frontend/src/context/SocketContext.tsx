import { createContext, useContext, useEffect } from "react";
import socket from "../utils/socket";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(socket);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      socket.connect();
      socket.emit("auth", { userId: user.id });
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
