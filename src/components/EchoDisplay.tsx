"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

type Echo = {
  id: number;
  memoryId: number;
  insight: string;
  createdAt: string;
};

type MemoryWithEcho = {
  id: number;
  title: string;
  content: string;
  echo?: Echo;
};

export default function EchoDisplay({ memoryId, onClose }: { memoryId: number; onClose: () => void }) {
  const { token } = useAuth();
  const [echo, setEcho] = useState<Echo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEcho = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/echoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ memoryId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate insight");
      setEcho(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load insight");
    } finally {
      setLoading(false);
    }
  }, [token, memoryId]);

  useEffect(() => {
    fetchEcho();
  }, [fetchEcho]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-800 rounded-lg border border-neutral-700 w-full max-w-2xl">
        <div className="p-6 border-b border-neutral-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">AI Insight</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white text-2xl">&times;</button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-neutral-400">Generating insight...</div>
            </div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : echo ? (
            <div>
               <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-700 mb-4">
                 <p className="text-lg text-neutral-200 italic leading-relaxed">
                   &ldquo;{echo.insight}&rdquo;
                 </p>
               </div>
              <p className="text-sm text-neutral-500">
                Generated {new Date(echo.createdAt).toLocaleString()}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
