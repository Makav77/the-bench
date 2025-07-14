import { useEffect, useState } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface Notification {
  _id: string;
  title: string;
  message?: string;
  read: boolean;
  createdAt: string;
}

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`http://localhost:3000/notifications/${user?.id}`);
        const data = await res.json();
        setNotifications(data);

        await fetch(`http://localhost:3000/notifications/read/all/${user?.id}`, {
          method: "PUT",
        });
      } catch (error) {
        console.error("Erreur de récupération des notifications :", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchNotifications();
  }, [user?.id]);

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
              className={`p-4 rounded-lg border shadow-sm ${
                n.read ? "bg-white" : "bg-blue-50 border-blue-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-semibold">{n.title}</h2>
                {n.read ? (
                  <CheckCircle2 className="text-green-500 w-5 h-5" />
                ) : (
                  <span className="text-sm text-blue-600 font-medium">
                    Nouveau
                  </span>
                )}
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
