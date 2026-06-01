"use client";

import { useActionState } from "react";
import { register, type RegisterState } from "@/actions/auth";
import Link from "next/link";

const initialState: RegisterState = {};

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-foreground/60">
            Register to start your NIST CSF 2.0 assessment
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          {state.errors?._form && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {state.errors._form.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-foreground"
              >
                Name (optional)
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground placeholder:text-foreground/40 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Your name"
              />
              {state.errors?.name && (
                <p className="mt-1 text-sm text-red-600">
                  {state.errors.name[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground placeholder:text-foreground/40 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="you@example.com"
              />
              {state.errors?.email && (
                <p className="mt-1 text-sm text-red-600">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground placeholder:text-foreground/40 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Minimum 8 characters"
              />
              {state.errors?.password && (
                <p className="mt-1 text-sm text-red-600">
                  {state.errors.password[0]}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-sm text-foreground/60">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
