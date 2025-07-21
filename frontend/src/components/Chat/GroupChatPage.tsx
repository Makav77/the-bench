import { useEffect, useState, useRef } from "react";
import { User } from "../../../../backend/src/modules/Users/entities/user.entity";
import { useSocket } from "../../context/SocketContext";
import { getRoomMessages, leaveGroup } from "../../api/chatService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function GroupChatPage({ user, groupId, groupName, onLeave}: { user: User | null, groupId: string, groupName: string, onLeave: () => void }) {
    const { t } = useTranslation("Chat/GroupChat");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<{content: string; userId: string; username: string}[]>([]);
    const socket = useSocket();

    const handleLeaveGroup = async () => {
        try {
            const res = await leaveGroup(groupId);
            toast.success(t("leftGroup"));

            onLeave();
        } catch (err) {
            console.error("Erreur lors de la sortie du groupe :", err);
            toast.error(t("cannotLeaveGroup"));
        }
    };

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getRoomMessages(`group-${groupId}`);
                setMessages(data);
            } catch (err) {
                console.error("Erreur lors du chargement des messages :", err);
                toast.error(t("errorLoadingMessages"));
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
        <div className="p-4 max-sm:p-4 max-sm:pt-8">
            <div className="flex items-center justify-between mb-2 max-sm:flex-col max-sm:mb-4">
            <h1 className="text-xl font-bold max-sm:text-2xl max-sm:text-center">{t("group")} {groupName}</h1>
            <button
                type="button"
                onClick={handleLeaveGroup}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded w-fit cursor-pointer max-sm:w-full max-sm:py-4 max-sm:text-lg max-sm:mt-2"
            >
                {t("leaveGroup")}
            </button>
            </div>
            <div ref={scrollContainerRef} className="border p-2 h-64 overflow-y-auto mb-2 flex flex-col gap-1 max-sm:h-[50vh] max-sm:p-4 max-sm:mb-4">
            {messages.map((msg, i) => {
                const isMine = msg.userId === user?.id;
                return (
                <div
                    key={i}
                    className={`max-w-[70%] rounded px-3 py-2 ${isMine ? 'ml-auto bg-blue-100 text-right' : 'mr-auto bg-gray-100 text-left'} max-sm:max-w-full max-sm:text-lg`}
                >
                    <div className="text-xs text-gray-500 mb-1">{msg.username}</div>
                    <div className="text-sm">{msg.content}</div>
                </div>
                );
            })}
            </div>
            <div className="flex gap-2 max-sm:flex-col">
            <input
                className="border flex-1 px-2 max-sm:py-4 max-sm:text-lg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-1 rounded max-sm:py-4 max-sm:text-lg max-sm:w-full">
                {t("send")}
            </button>
            </div>
        </div>
    );
}
