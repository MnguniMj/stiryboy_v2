"use client";

import { motion } from "framer-motion";
import { Chrome, Eye, EyeOff, Github, Loader2, Lock, Mail, UserRound } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type ProvidersStatus = {
  google: boolean;
  github: boolean;
};

function buildLoginErrorMessage(error: string | undefined | null, status: number | undefined) {
  if (!error) return "Invalid email or password.";

  const code = error.trim();
  switch (code) {
    case "CredentialsSignin":
      return "Invalid email or password. Please check your details and try again.";
    case "AccessDenied":
      return "Sign-in was denied.";
    case "Configuration":
      return "Server configuration error. Please contact support or check environment variables.";
    case "OAuthSignin":
    case "OAuthCallback":
    case "OAuthCreateAccount":
    case "OAuthAccountNotLinked":
      return `Sign-in with provider failed (${code}).`;
    default:
      if (status && status >= 500) {
        return "Server error. Please try again in a moment.";
      }
      return "Invalid email or password.";
  }
}

export function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [providers, setProviders] = useState<ProvidersStatus | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/providers-status", { cache: "no-store" })
      .then(async (r) => (r.ok ? (r.json() as Promise<ProvidersStatus>) : null))
      .then((data) => {
        if (mounted && data) setProviders(data);
      })
      .catch(() => {
        if (mounted) setProviders({ google: false, github: false });
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function handleOAuth(provider: "google" | "github") {
    try {
      const result = await signIn(provider, { callbackUrl, redirect: false });
      if (result?.error) {
        throw new Error(buildLoginErrorMessage(result.error, result.status));
      }
      if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Provider sign-in failed."
      );
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    try {
      if (mode === "signup") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: String(formData.get("name")),
            email,
            password
          })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const msg =
            typeof data?.message === "string" && data.message.trim().length > 0
              ? data.message
              : "Unable to create account.";
          throw new Error(msg);
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl
      });

      if (result?.error) {
        throw new Error(buildLoginErrorMessage(result.error, result.status));
      }

      toast.success(mode === "signup" ? "Account created" : "Welcome back");
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const hasAnyProvider = providers ? providers.google || providers.github : true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-glow dark:border-white/10 dark:bg-slate-900"
    >
      <div className="mb-6 text-center">
        <Link href="/" className="inline-flex items-end text-3xl font-black text-slate-950 dark:text-white">
          amazon<span className="text-amazon-orange">.in</span>
        </Link>
        <h1 className="mt-5 text-2xl font-black tracking-normal text-slate-950 dark:text-white">
          {mode === "signup" ? "Create account" : "Sign in"}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {mode === "signup" ? "Start shopping with fast checkout and saved addresses." : "Access orders, wishlist, cart sync, and admin tools."}
        </p>
      </div>

      {hasAnyProvider && (
        <div className="grid gap-2">
          {providers ? (
            <>
              {providers.google && (
                <Button type="button" variant="outline" className="w-full" onClick={() => handleOAuth("google")}>
                  <Chrome className="h-4 w-4" />
                  Continue with Google
                </Button>
              )}
              {providers.github && (
                <Button type="button" variant="outline" className="w-full" onClick={() => handleOAuth("github")}>
                  <Github className="h-4 w-4" />
                  Continue with GitHub
                </Button>
              )}
            </>
          ) : (
            <>
              <Button type="button" variant="outline" className="w-full" onClick={() => handleOAuth("google")}>
                <Chrome className="h-4 w-4" />
                Continue with Google
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => handleOAuth("github")}>
                <Github className="h-4 w-4" />
                Continue with GitHub
              </Button>
            </>
          )}
        </div>
      )}

      {mode === "login" && (
        <p className="mt-3 text-center text-sm">
          <Link href="/forgot-password" className="text-amazon-teal hover:underline">
            Forgot password?
          </Link>
        </p>
      )}

      <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase text-slate-400">
        <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
        or
        <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        {mode === "signup" && (
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-200">Your name</span>
            <span className="flex items-center gap-2 rounded-md border border-slate-200 px-3 focus-within:border-amazon-orange dark:border-white/10">
              <UserRound className="h-4 w-4 text-slate-400" />
              <input name="name" required minLength={2} className="h-11 flex-1 bg-transparent outline-none" />
            </span>
          </label>
        )}

        <label className="block">
          <span className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-200">Email</span>
          <span className="flex items-center gap-2 rounded-md border border-slate-200 px-3 focus-within:border-amazon-orange dark:border-white/10">
            <Mail className="h-4 w-4 text-slate-400" />
            <input name="email" type="email" required className="h-11 flex-1 bg-transparent outline-none" />
          </span>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-200">Password</span>
          <span className="flex items-center gap-2 rounded-md border border-slate-200 px-3 focus-within:border-amazon-orange dark:border-white/10">
            <Lock className="h-4 w-4 text-slate-400" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              minLength={6}
              required
              className="h-11 flex-1 bg-transparent outline-none"
            />
            <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">
              {showPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
            </button>
          </span>
        </label>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "signup" ? "Create account" : "Sign in"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
        {mode === "signup" ? "Already have an account?" : "New to Amazon?"}{" "}
        <Link href={`${mode === "signup" ? "/login" : "/signup"}?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-bold text-amazon-teal hover:text-amazon-orange">
          {mode === "signup" ? "Sign in" : "Create your account"}
        </Link>
      </p>
    </motion.div>
  );
}
