import { getNotifications } from "@/actions/notifications";
import NotificationsListClient from "./NotificationsListClient";

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Notifications</h1>
      <NotificationsListClient initialNotifications={notifications} />
    </div>
  );
}
