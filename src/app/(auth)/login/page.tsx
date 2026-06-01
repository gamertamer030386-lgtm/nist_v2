"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/assessments");
      }
    } catch {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          NIST CSF 2.0 Maturity Assessment
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div
            className="rounded-md bg-red-50 p-4 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* Demo Credentials */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
          Demo Accounts
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              setEmail("admin@system.local");
              setPassword("Admin123!");
            }}
            className="flex w-full items-center justify-between rounded-md border border-purple-200 bg-white px-3 py-2 text-sm hover:bg-purple-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Super Admin</span>
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
              admin@system.local
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("demo.admin@example.com");
              setPassword("Admin123!");
            }}
            className="flex w-full items-center justify-between rounded-md border border-blue-200 bg-white px-3 py-2 text-sm hover:bg-blue-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Admin</span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              demo.admin@example.com
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("demo.user@example.com");
              setPassword("User123!");
            }}
            className="flex w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-900">End User</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
              demo.user@example.com
            </span>
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-gray-400">
          Click to fill credentials, then press Sign in
        </p>
      </div>
    </div>
  );
}
