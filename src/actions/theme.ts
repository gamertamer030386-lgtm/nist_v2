"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ThemeMode } from "@prisma/client";

/**
 * Updates the current user's theme preference in the database.
 */
export async function updateThemePreference(themeMode: ThemeMode) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { themeMode },
  });

  return { success: true };
}
