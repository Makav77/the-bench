import { Bell } from "lucide-react";

export const NotificationBell = ({ count }: { count: number }) => {
  return (
    <div className="relative">
      <Bell className="w-5 h-5 text-gray-600" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center animate-ping-slow">
          {count}
        </span>
      )}
    </div>
  );
};