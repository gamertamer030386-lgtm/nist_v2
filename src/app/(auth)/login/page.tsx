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
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      {/* ─── Navigation Bar ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-8 py-4 text-sm font-medium text-purple-700">
        <span className="cursor-pointer hover:text-purple-900 transition-colors">HOME</span>
        <span className="cursor-pointer hover:text-purple-900 transition-colors">SERVICES</span>
        <span className="cursor-pointer hover:text-purple-900 transition-colors">ABOUT US</span>
        <span className="cursor-pointer hover:text-purple-900 transition-colors">BLOG</span>
        <span className="cursor-pointer hover:text-purple-900 font-bold transition-colors">GET ASSESSED</span>
      </nav>

      {/* ─── Left Side: Login Form ──────────────────────────────────────── */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-12 lg:px-20 pt-16">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-gray-900 italic mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-600 mb-8">
            Login to your secure data portal
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email Address"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
              <div className="text-right mt-1">
                <span className="text-xs text-purple-600 cursor-pointer hover:underline">Forgot password?</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
              <label htmlFor="remember" className="text-sm text-gray-600">Remember me</label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-purple-500/30 hover:from-purple-700 hover:to-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-all"
            >
              {isLoading ? "LOGGING IN..." : "LOG IN"}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-600">
            New to Get Assessed? <Link href="/register" className="text-purple-600 font-medium hover:underline">Sign up here.</Link>
          </p>

          {/* Demo Credentials */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2 font-medium">Demo Accounts (click to fill):</p>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => { setEmail("admin@system.local"); setPassword("Admin123!"); }}
                className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs text-purple-700 hover:bg-purple-100 transition-colors"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => { setEmail("demo.admin@example.com"); setPassword("Admin123!"); }}
                className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs text-purple-700 hover:bg-purple-100 transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => { setEmail("demo.user@example.com"); setPassword("User123!"); }}
                className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs text-purple-700 hover:bg-purple-100 transition-colors"
              >
                End User
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right Side: Cybersecurity Visual with XIR Logo ─────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-950">
        {/* Grid floor effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2" style={{
          background: "linear-gradient(to top, rgba(147, 51, 234, 0.3), transparent)",
          backgroundImage: `
            linear-gradient(to right, rgba(168, 85, 247, 0.2) 1px, transparent 1px),
            linear-gradient(to top, rgba(168, 85, 247, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          transform: "perspective(500px) rotateX(60deg)",
          transformOrigin: "bottom",
        }} />

        {/* Glowing dots / network nodes */}
        <div className="absolute inset-0">
          {[
            { top: "15%", left: "20%", size: "3px" },
            { top: "25%", left: "70%", size: "4px" },
            { top: "40%", left: "30%", size: "3px" },
            { top: "35%", left: "80%", size: "5px" },
            { top: "55%", left: "15%", size: "3px" },
            { top: "20%", left: "50%", size: "4px" },
            { top: "60%", left: "60%", size: "3px" },
            { top: "45%", left: "45%", size: "4px" },
          ].map((dot, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-purple-400 animate-pulse"
              style={{ top: dot.top, left: dot.left, width: dot.size, height: dot.size, animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <line x1="20%" y1="15%" x2="50%" y2="20%" stroke="#a855f7" strokeWidth="0.5" />
          <line x1="50%" y1="20%" x2="70%" y2="25%" stroke="#a855f7" strokeWidth="0.5" />
          <line x1="30%" y1="40%" x2="45%" y2="45%" stroke="#a855f7" strokeWidth="0.5" />
          <line x1="45%" y1="45%" x2="80%" y2="35%" stroke="#a855f7" strokeWidth="0.5" />
          <line x1="15%" y1="55%" x2="30%" y2="40%" stroke="#a855f7" strokeWidth="0.5" />
          <line x1="60%" y1="60%" x2="80%" y2="35%" stroke="#a855f7" strokeWidth="0.5" />
        </svg>

        {/* Floating icons */}
        <div className="absolute top-[15%] right-[15%] w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
          <svg className="w-7 h-7 text-purple-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </div>

        <div className="absolute top-[30%] left-[10%] w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
          <svg className="w-7 h-7 text-purple-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
          </svg>
        </div>

        <div className="absolute bottom-[30%] right-[10%] w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
          <svg className="w-7 h-7 text-purple-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>

        {/* XIR Diamond Logo - Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 blur-3xl bg-purple-500/30 rounded-full scale-150" />

            {/* Diamond shape with XIR text */}
            <svg className="relative w-48 h-48 drop-shadow-2xl" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Diamond body */}
              <path d="M100 20 L170 80 L100 180 L30 80 Z" fill="url(#diamondGradient)" stroke="url(#diamondStroke)" strokeWidth="2" />
              {/* Inner facets */}
              <path d="M100 20 L100 180" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <path d="M30 80 L170 80" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <path d="M100 20 L30 80" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <path d="M100 20 L170 80" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <path d="M65 80 L100 180" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <path d="M135 80 L100 180" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              {/* XIR Text */}
              <text x="100" y="95" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="4">XIR</text>
              <text x="100" y="115" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="9" fontFamily="Arial, sans-serif" letterSpacing="1">EXTENDED INCIDENT RESPONSE</text>
              {/* Gradients */}
              <defs>
                <linearGradient id="diamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="diamondStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Bottom glow line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
      </div>
    </div>
  );
}
