import { useState, useEffect, useRef } from "react";
import { User } from "../../../../backend/src/modules/Users/entities/user.entity";
import { useSocket } from "../../context/SocketContext";
import { getUserById } from "../../api/userService";
import { getRoomMessages } from "../../api/chatService";

export default function PrivateChatPage({ user, userId } : { user: User | null, userId: string }) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<{content: string; userId: string; username: string}[]>([]);
    const [friend, setFriend] = useState<{id: string; firstname: string; lastname: string}>();
    const socket = useSocket();

    useEffect(() => {
        const fetchFriend = async () => {
          try {
            const friend = await getUserById(userId);
            setFriend(friend);
          } catch (err) {
            console.error("Failed to fetch friend:", err);
          }
        }
        fetchFriend();
      }, [userId]);

    useEffect(() => {
      if (!user?.id) return;

      const room = [user.id, userId].sort().join("_");

      getRoomMessages(`private-${room}`)
        .then(setMessages)
        .catch((err) =>
          console.error("Erreur lors du chargement des messages :", err)
        );
    }, [user?.id, userId]);
    
    useEffect(() => {
        if (user?.id) {
            const room = [user.id, userId].sort().join("_");
            socket.emit("join", room);

            const eventName = `private-message-${room}`;
            const handleMessage = (msg: { content: string; userId: string; username: string }) => {
                setMessages(prev => [...prev, msg]);
            };

            socket.on(eventName, handleMessage);
            return () => {
                socket.off(eventName, handleMessage);
            };
        }
    }, [user, userId]);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
      scrollContainerRef.current?.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages]);

    const sendMessage = () => {
        if (message.trim()) {
            const room = [user?.id, userId].sort().join("_");
            socket.emit("message", {
                room,
                content: message,
                userId: user?.id,
                username: `${user?.firstname} ${user?.lastname}`,
            });
            setMessage("");
        }
    };

    return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">{friend?.firstname} {friend?.lastname}</h1>
      <div ref={scrollContainerRef} className="border p-2 h-64 overflow-y-auto mb-2 flex flex-col gap-1">
        {messages.map((msg, i) => {
          const isMine = msg.userId === user?.id;
          return (
            <div
              key={i}
              className={`max-w-[70%] rounded px-3 py-2 ${
                isMine ? 'ml-auto bg-blue-100 text-right' : 'mr-auto bg-gray-100 text-left'
              }`}
            >
              <div className="text-xs text-gray-500 mb-1">{msg.username}</div>
              <div className="text-sm">{msg.content}</div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <input
          className="border flex-1 px-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-1 rounded">
          Envoyer
        </button>
      </div>
    </div>
  );
}