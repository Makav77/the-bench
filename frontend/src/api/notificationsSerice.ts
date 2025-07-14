import apiClient from "./apiClient";

export interface Notification {
  _id: string;
  title: string;
  message?: string;
  read: boolean;
  createdAt: string;
}

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  const response = await apiClient.get(`/notifications/${userId}`);
  return response.data;
};

export const markAllAsRead = async (userId: string): Promise<void> => {
  await apiClient.put(`/notifications/read/all/${userId}`);
};

export const markAsUnread = async (notificationId: string): Promise<void> => {
  await apiClient.put(`/notifications/${notificationId}/read`, {
    read: false,
  });
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  await apiClient.delete(`/notifications/${notificationId}`);
};