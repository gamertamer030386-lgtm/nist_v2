"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", { email, password, redirect: false });
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
    <div className="fixed inset-0 flex w-screen h-screen overflow-hidden">
      {/* Full-page XIR background image */}
      <img
        src="/images/xir background.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Light overlay so login form is readable */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />

      {/* ─── Left Side: Login Form ──────────────────────────────────────── */}
      <div className="w-full flex flex-col justify-center items-end px-8 sm:px-16 lg:px-24 relative z-10">
        <div className="w-full max-w-sm bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/50">
          <h1 className="text-4xl font-bold text-gray-900 italic mb-1 text-center">
            Welcome back!
          </h1>
          <p className="text-gray-500 mb-8 text-sm text-center">
            Login to your secure data portal
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email Address"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white text-sm"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white pr-12 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                Remember me
              </label>
              <span className="text-xs text-purple-600 cursor-pointer hover:underline">Forgot password?</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-purple-500/25 hover:from-purple-700 hover:to-purple-900 disabled:opacity-50 transition-all"
            >
              {isLoading ? "LOGGING IN..." : "LOG IN"}
            </button>
          </form>

          <p className="mt-5 text-sm text-gray-600">
            New to Get Assessed? <Link href="/register" className="text-purple-600 font-semibold hover:underline">Sign up here.</Link>
          </p>

          {/* Demo Accounts */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400 mb-2">Demo Accounts:</p>
            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={() => { setEmail("admin@system.local"); setPassword("Admin123!"); }}
                className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs text-purple-700 hover:bg-purple-100">
                Super Admin
              </button>
              <button type="button" onClick={() => { setEmail("demo.admin@example.com"); setPassword("Admin123!"); }}
                className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs text-purple-700 hover:bg-purple-100">
                Admin
              </button>
              <button type="button" onClick={() => { setEmail("demo.user@example.com"); setPassword("User123!"); }}
                className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs text-purple-700 hover:bg-purple-100">
                End User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
