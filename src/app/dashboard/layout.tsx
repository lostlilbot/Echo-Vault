"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { token, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!token) {
      router.push("/auth");
    }
  }, [token, router]);

  if (!token) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-white text-lg">Redirecting...</div>
      </div>
    );
  }

  const navItems = [
    { href: "/dashboard", label: "Memories", icon: "📝" },
    { href: "/dashboard/synthesis", label: "Synthesis", icon: "🔮" },
  ];

  return (
    <div className="min-h-screen bg-neutral-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-800 border-r border-neutral-700 flex flex-col">
        <div className="p-6 border-b border-neutral-700">
          <h1 className="text-2xl font-bold text-white tracking-tight">EchoVault</h1>
          <p className="text-sm text-neutral-400 mt-1">Memory & Reflection</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-neutral-300 hover:bg-neutral-700 hover:text-white"
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-neutral-700">
          <div className="mb-4 px-4">
            <p className="text-sm text-neutral-300 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-white rounded-lg transition-colors"
          >
            <span>🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
