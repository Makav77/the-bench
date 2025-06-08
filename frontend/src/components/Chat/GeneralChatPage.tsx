import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useAuth } from "../../context/AuthContext";

const socket = io("http://localhost:3000");

export default function GeneralChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{content: string; userId: string; username: string}[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      socket.emit("auth", { userId: user.id });
      socket.emit("join", "general");
    }

    socket.on("message", (msg: { content: string; userId: string; username: string }) => {
      console.log("Received message:", msg);
      setMessages(prev => [...prev, msg]);
    });
    return () => {
      socket.off("message");
    };
  }, [user]);


  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("message", { room: "general", content: message, userId: user?.id });
      setMessage("");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Messagerie Générale</h1>
      <div className="border p-2 h-64 overflow-y-auto mb-2 flex flex-col gap-1">
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
