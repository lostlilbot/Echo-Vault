"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

type Memory = {
  id: number;
  title: string;
  content: string;
};

export default function SynthesisPage() {
  const { token } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [synthesizing, setSynthesizing] = useState(false);
  const [result, setResult] = useState<{ synthesis: string; memoryCount: number } | null>(null);
  const [error, setError] = useState("");

  const fetchMemories = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/memories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");
      setMemories(data.memories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load memories");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  function toggleSelect(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  async function handleSynthesize() {
    if (selectedIds.length < 2) {
      setError("Select at least 2 memories to synthesize");
      return;
    }
    setSynthesizing(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/synthesis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ memoryIds: selectedIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to synthesize");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Synthesis failed");
    } finally {
      setSynthesizing(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Synthesis</h1>
        <p className="text-neutral-400 mt-1">
          Combine multiple memories to discover connections and generate new insights
        </p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-neutral-400 py-12">Loading memories...</div>
      ) : memories.length < 2 ? (
        <div className="text-center py-12 bg-neutral-800 rounded-lg border border-neutral-700">
          <p className="text-neutral-400 mb-4">
            You need at least 2 memories to create a synthesis. Create more memories first.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Select Memories</h2>
            <div className="space-y-3">
              {memories.map((memory) => (
                <label
                  key={memory.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedIds.includes(memory.id)
                      ? "bg-blue-900/30 border-blue-500"
                      : "bg-neutral-800 border-neutral-700 hover:border-neutral-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(memory.id)}
                    onChange={() => toggleSelect(memory.id)}
                    className="mt-1 w-5 h-5 accent-blue-500"
                  />
                  <div>
                    <p className="font-medium text-white">{memory.title}</p>
                    <p className="text-sm text-neutral-400 line-clamp-2 mt-1">
                      {memory.content}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <button
              onClick={handleSynthesize}
              disabled={synthesizing || selectedIds.length < 2}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-medium rounded-lg transition-colors"
            >
              {synthesizing ? "Synthesizing..." : `Synthesize ${selectedIds.length} Memories`}
            </button>
          </div>

          {result && (
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-700 p-8">
              <h2 className="text-xl font-bold text-white mb-4">Synthesis</h2>
              <div className="bg-neutral-900/50 rounded-lg p-6 border border-neutral-700">
                <p className="text-lg text-neutral-200 leading-relaxed">{result.synthesis}</p>
              </div>
              <p className="text-sm text-neutral-500 mt-3">
                Combined insights from {result.memoryCount} memories
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
