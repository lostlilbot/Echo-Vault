"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import EchoDisplay from "@/components/EchoDisplay";

type Memory = {
  id: number;
  title: string;
  content: string;
  pastebinUrl: string;
  pastebinKey: string;
  createdAt: string;
};

export default function MemoriesPage() {
  const { token } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedMemoryId, setSelectedMemoryId] = useState<number | null>(null);

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

  async function handleCreateMemory(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !newTitle.trim() || !newContent.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      setMemories((prev) => [data, ...prev]);
      setShowModal(false);
      setNewTitle("");
      setNewContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create memory");
    } finally {
      setCreating(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Memories</h1>
          <p className="text-neutral-400 mt-1">Your stored thoughts and reflections</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          + New Memory
        </button>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-neutral-400 py-12">Loading memories...</div>
      ) : memories.length === 0 ? (
        <div className="text-center py-12 bg-neutral-800 rounded-lg border border-neutral-700">
          <p className="text-neutral-400 mb-4">No memories yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Create your first memory
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {memories.map((memory) => (
            <div
              key={memory.id}
              className="bg-neutral-800 rounded-lg border border-neutral-700 p-6 hover:border-neutral-600 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-semibold text-white">{memory.title}</h2>
                <span className="text-sm text-neutral-500">{formatDate(memory.createdAt)}</span>
              </div>
              <p className="text-neutral-300 mb-4 line-clamp-3">{memory.content}</p>
              <div className="flex gap-3">
                <a
                  href={memory.pastebinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  View on Pastebin →
                </a>
                <button
                  onClick={() => setSelectedMemoryId(memory.id)}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  ✨ Get Insight
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-800 rounded-lg border border-neutral-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-700">
              <h2 className="text-xl font-bold text-white">Create Memory</h2>
            </div>
            <form onSubmit={handleCreateMemory} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Give your memory a title..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Content
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Write your thoughts..."
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-neutral-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium rounded-lg transition-colors"
                >
                  {creating ? "Creating..." : "Create Memory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Echo Modal */}
      {selectedMemoryId !== null && (
        <EchoDisplay
          memoryId={selectedMemoryId}
          onClose={() => setSelectedMemoryId(null)}
        />
      )}
    </div>
  );
}
