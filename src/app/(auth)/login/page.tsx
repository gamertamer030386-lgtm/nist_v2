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
    <div className="flex min-h-screen">
      {/* ─── Left Side: Branding & Logo ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-300 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 text-center px-12 max-w-lg">
          {/* Logo */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl">
              <svg className="w-14 h-14 text-white" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 4L8 16v16c0 14.4 10.24 27.84 24 32 13.76-4.16 24-17.6 24-32V16L32 4z" stroke="currentColor" strokeWidth="3" fill="none"/>
                <path d="M32 12L14 21v12c0 10.8 7.68 20.88 18 24 10.32-3.12 18-13.2 18-24V21L32 12z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1"/>
                <path d="M22 32l6 6 14-14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Extended Incident Response
          </h1>
          <div className="w-16 h-1 bg-purple-400 mx-auto mb-4 rounded-full"></div>
          <h2 className="text-xl font-medium text-purple-200 mb-6">
            Cybersecurity Posture Maturity Assessment
          </h2>
          <p className="text-purple-300 text-sm leading-relaxed">
            Comprehensive NIST CSF 2.0 framework assessment tool. Evaluate your organization&apos;s cybersecurity maturity across all 106 controls, generate actionable recommendations, and build a prioritized roadmap to strengthen your security posture.
          </p>

          {/* Features */}
          <div className="mt-10 grid grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="text-xs text-purple-200">106 NIST Controls</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="text-xs text-purple-200">Gap Analysis & Heatmap</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="text-xs text-purple-200">AI Recommendations</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="text-xs text-purple-200">Implementation Roadmap</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right Side: Login Form ─────────────────────────────────────── */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center items-center px-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo (shown on small screens) */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-purple-900 mb-4">
              <svg className="w-10 h-10 text-white" viewBox="0 0 64 64" fill="none">
                <path d="M32 4L8 16v16c0 14.4 10.24 27.84 24 32 13.76-4.16 24-17.6 24-32V16L32 4z" stroke="currentColor" strokeWidth="3" fill="none"/>
                <path d="M22 32l6 6 14-14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Extended Incident Response</h1>
            <p className="text-sm text-gray-500">Cybersecurity Posture Maturity Assessment</p>
          </div>

          {/* Welcome text */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-1 text-sm text-gray-500">
              Sign in to continue your assessment
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
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
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-lg bg-purple-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-700/30 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 rounded-xl border border-purple-100 bg-purple-50/50 p-5">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-purple-600">
              Demo Accounts
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => { setEmail("admin@system.local"); setPassword("Admin123!"); }}
                className="flex w-full items-center justify-between rounded-lg border border-purple-200 bg-white px-4 py-2.5 text-sm hover:bg-purple-50 transition-colors"
              >
                <span className="font-medium text-gray-900">Super Admin</span>
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                  admin@system.local
                </span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail("demo.admin@example.com"); setPassword("Admin123!"); }}
                className="flex w-full items-center justify-between rounded-lg border border-purple-200 bg-white px-4 py-2.5 text-sm hover:bg-purple-50 transition-colors"
              >
                <span className="font-medium text-gray-900">Admin</span>
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                  demo.admin@example.com
                </span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail("demo.user@example.com"); setPassword("User123!"); }}
                className="flex w-full items-center justify-between rounded-lg border border-purple-200 bg-white px-4 py-2.5 text-sm hover:bg-purple-50 transition-colors"
              >
                <span className="font-medium text-gray-900">End User</span>
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                  demo.user@example.com
                </span>
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-purple-500">
              Click to fill credentials, then press Sign in
            </p>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-gray-400">
            © 2024 Extended Incident Response. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
