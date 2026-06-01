"use client";

import { useState } from "react";
import { markNotificationRead } from "@/actions/notifications";

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  referenceId: string | null;
  createdAt: Date;
}

interface Props {
  initialNotifications: Notification[];
}

export default function NotificationsListClient({ initialNotifications }: Props) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleMarkRead = async (notificationId: string) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch {
      // Silently fail
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (notifications.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <BellOffIcon className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-3 text-sm text-gray-500">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`rounded-lg border p-4 transition-colors ${
            notification.isRead
              ? "border-gray-200 bg-white"
              : "border-blue-200 bg-blue-50"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {!notification.isRead && (
                <span className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-blue-500" />
              )}
              <div className={notification.isRead ? "pl-5" : ""}>
                <p className="text-sm font-semibold text-gray-900">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {notification.message}
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  {formatDate(notification.createdAt)}
                </p>
              </div>
            </div>
            {!notification.isRead && (
              <button
                onClick={() => handleMarkRead(notification.id)}
                className="flex-shrink-0 rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
              >
                Mark read
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function BellOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.143 17.082a24.248 24.248 0 003.714.318 23.997 23.997 0 003.143-.214m-6.857-.104a23.848 23.848 0 01-5.454-1.31A8.967 8.967 0 005.999 9.75v-.7V9A6 6 0 0118 9v.75a8.967 8.967 0 002.312 6.022c-.654.242-1.32.453-1.998.632M9.143 17.082a3 3 0 005.714 0"
      />
    </svg>
  );
}
