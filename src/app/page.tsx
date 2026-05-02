"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-white text-lg">Redirecting...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4 tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          EchoVault
        </h1>
        <p className="text-xl text-neutral-400 max-w-2xl">
          Store your memories, let free local AI reflect on them, and discover hidden connections
        </p>
      </div>

      <div className="flex gap-6">
        <a
          href="/auth?mode=login"
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-lg"
        >
          Sign In
        </a>
        <a
          href="/auth?mode=register"
          className="px-8 py-4 bg-neutral-700 hover:bg-neutral-600 text-white font-medium rounded-lg transition-colors text-lg"
        >
          Create Account
        </a>
      </div>

      <div className="mt-16 max-w-4xl w-full">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-6">
            <div className="text-3xl mb-3">💾</div>
            <h3 className="text-lg font-semibold mb-2">Secure Storage</h3>
            <p className="text-neutral-400">
              Your memories are stored as Pastebin notes with user-owned encryption
            </p>
          </div>
          <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-6">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="text-lg font-semibold mb-2">Free Local AI</h3>
            <p className="text-neutral-400">
              Flan-T5 AI runs entirely on your machine – no API costs, no data leaves
            </p>
          </div>
          <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-6">
            <div className="text-3xl mb-3">🔗</div>
            <h3 className="text-lg font-semibold mb-2">Synthesis</h3>
            <p className="text-neutral-400">
              Combine multiple memories to uncover patterns and generate new insights
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
