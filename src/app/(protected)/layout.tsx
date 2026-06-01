import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/navigation/Sidebar";
import { ToastProvider } from "@/components/Toast";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import ThemeToggle from "@/components/theme/ThemeToggle";
import NotificationBell from "@/components/notifications/NotificationBell";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const initialTheme = (session.user.themeMode?.toLowerCase() ?? "day") as "day" | "night";

  return (
    <ThemeProvider initialTheme={initialTheme}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar user={session.user} />
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header with theme toggle and notification bell */}
          <header className="flex h-14 items-center justify-end gap-2 border-b border-gray-200 bg-white px-6">
            <ThemeToggle />
            <NotificationBell />
          </header>
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <ToastProvider>{children}</ToastProvider>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
