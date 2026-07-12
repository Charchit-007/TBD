import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../hooks/useAuth";
import Button from "../Button/button";

interface CreateSubredditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubredditCreated?: () => void;
}

export default function CreateSubredditModal({
  isOpen,
  onClose,
  onSubredditCreated,
}: CreateSubredditModalProps) {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/subreddit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, category }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subreddit.");
      }

      onSubredditCreated?.();
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Something went wrong.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-white dark:bg-[#1a1a1b] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl relative flex flex-col gap-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col gap-1 mt-2">
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">
            Create a Community
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Create a space for users to post, read, and vote on things they care about.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 px-1">Community Name</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-sm font-semibold text-zinc-400 dark:text-zinc-600">r/</span>
              <input
                type="text"
                required
                maxLength={21}
                placeholder="reactjs"
                value={name}
                onChange={(e) => setName(e.target.value.replace(/\s+/g, ""))} // remove spaces
                className="w-full pl-8 pr-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              />
            </div>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 px-1">Community names are case-sensitive and cannot be changed.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 px-1">Category</label>
            <input
              type="text"
              required
              placeholder="e.g. Technology, Gaming, News"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              "Create Community"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
