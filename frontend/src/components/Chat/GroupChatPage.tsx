import { useEffect, useState, useRef } from "react";
import { User } from "../../../../backend/src/modules/Users/entities/user.entity";
import { useSocket } from "../../context/SocketContext";
import { getRoomMessages, leaveGroup } from "../../api/chatService";

export default function GroupChatPage({ user, groupId, groupName, onLeave}: { user: User | null, groupId: string, groupName: string, onLeave: () => void }) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<{content: string; userId: string; username: string}[]>([]);
    const socket = useSocket();

    const handleLeaveGroup = async () => {
        try {
            const res = await leaveGroup(groupId);
            alert("Vous avez quitté le groupe.");

            onLeave();
        } catch (err) {
            console.error("Erreur lors de la sortie du groupe :", err);
            alert("Impossible de quitter le groupe.");
        }
    };

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getRoomMessages(`group-${groupId}`);
                setMessages(data);
            } catch (err) {
                console.error("Erreur lors du chargement des messages :", err);
            }
        };

        fetchHistory();
    }, [groupId]);

    useEffect(() => {
        if (user?.id) {
            const room = `group-${groupId}`;
            const event = `group-message-${groupId}`;

            socket.emit("join", room);
        
            const handleMessage = (msg: { content: string; userId: string; username: string }) => {
              setMessages(prev => [...prev, msg]);
            };

            socket.on(event, handleMessage);

            return () => {
                socket.off(event, handleMessage);
            };
        }
    }, [user, groupId]);;

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        scrollContainerRef.current?.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: 'smooth',
      });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = () =>{
        if (message.trim()){
            socket.emit("message", {
                room: `group-${groupId}`,
                content: message,
                userId: user?.id,
                username: `${user?.firstname} ${user?.lastname}`,
            });
            setMessage("");
        } 
    }

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-xl font-bold">Groupe {groupName}</h1>
                <button
                    type="button"
                    onClick={handleLeaveGroup}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded w-fit cursor-pointer"
                >
                    Quitter le groupe
                </button>
            </div>
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