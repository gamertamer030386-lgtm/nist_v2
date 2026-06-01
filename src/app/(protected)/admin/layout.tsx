import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Allow both SUPER_ADMIN and ADMIN roles
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    redirect("/assessments");
  }

  return <>{children}</>;
}
