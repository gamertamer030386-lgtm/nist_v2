import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { ToastProvider } from "@/components/Toast";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import ThemeToggle from "@/components/theme/ThemeToggle";
import NotificationBell from "@/components/notifications/NotificationBell";
import LogoutButton from "@/components/LogoutButton";

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
      <div className="flex h-screen flex-col overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
        {/* Top Header Bar */}
        <header className="flex h-12 items-center justify-between border-b border-[var(--border-color)] bg-[var(--card-bg)] px-4 flex-shrink-0">
          {/* Left: App name */}
          <Link href="/assessments" className="text-sm font-bold text-[var(--foreground)]">
            NIST CSF 2.0 Assessment
          </Link>

          {/* Right: Tasks, Theme, Notifications, User */}
          <div className="flex items-center gap-3">
            <Link
              href="/tasks"
              className="text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              My Tasks
            </Link>
            <ThemeToggle />
            <NotificationBell />
            <div className="flex items-center gap-2 border-l border-[var(--border-color)] pl-3">
              <span className="text-xs text-[var(--muted)]">
                {session.user.name || session.user.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[var(--background)] p-4">
          <ToastProvider>{children}</ToastProvider>
        </main>
      </div>
    </ThemeProvider>
  );
}
