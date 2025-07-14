import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Trash2, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getNotifications,
  markAllAsRead,
  markAsUnread,
  deleteNotification,
  Notification,
} from "../../api/notificationsSerice";

// interface Notification {
//   _id: string;
//   title: string;
//   message?: string;
//   read: boolean;
//   createdAt: string;
// }

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!user?.id) return;

        const data = await getNotifications(user.id);
        setNotifications(data);

        await markAllAsRead(user.id);
      } catch (error) {
        console.error("Erreur de récupération des notifications :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user?.id]);

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const handleMarkUnread = async (id: string) => {
    await markAsUnread(id);

    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: false } : n))
    );
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Bell className="w-6 h-6" /> Notifications
      </h1>

      {loading ? (
        <p>Chargement...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-500">Aucune notification.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((n) => (
            <li
              key={n._id}
              className={`p-4 rounded-lg border shadow-sm relative ${
                n.read ? "bg-white" : "bg-blue-50 border-blue-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {n.read && (
                    <CheckCircle2
                      className="text-green-500 w-5 h-5"
                      //title="Lue"
                    />
                  )}
                  <h2 className="text-lg font-semibold">{n.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  {!n.read && (
                    <span className="text-sm text-blue-600 font-medium">
                      Nouveau
                    </span>
                  )}
                  <button
                    onClick={() => handleMarkUnread(n._id)}
                    className="text-gray-500 hover:text-yellow-600 transition"
                    title="Marquer comme non lu"
                  >
                    <EyeOff className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(n._id)}
                    className="text-gray-500 hover:text-red-600 transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {n.message && <p className="text-gray-700">{n.message}</p>}
              <p className="text-sm text-gray-400 mt-2">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPage;
