"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),
});

export type RegisterState = {
  errors?: {
    email?: string[];
    password?: string[];
    name?: string[];
    _form?: string[];
  };
  success?: boolean;
};

export async function register(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    name: formData.get("name") as string || undefined,
  };

  const result = registerSchema.safeParse(rawData);

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password, name } = result.data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      errors: {
        _form: ["An account with this email already exists"],
      },
    };
  }

  // Hash password with bcrypt (12 rounds)
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user with default END_USER role
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: name || null,
    },
  });

  redirect("/login");
}
