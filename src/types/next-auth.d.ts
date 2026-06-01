import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      officeId: string | null;
      themeMode: string;
    };
  }

  interface User {
    role?: string;
    officeId?: string | null;
    themeMode?: string;
    isActive?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    officeId?: string | null;
    themeMode?: string;
    isActive?: boolean;
  }
}
