import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../hooks/useAuth";
import Button from "../Button/button";

interface Subreddit {
  id: string;
  name: string;
  category: string;
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
  onCreateCommunityClick?: () => void;
}

export default function CreatePostModal({
  isOpen,
  onClose,
  onPostCreated,
  onCreateCommunityClick,
}: CreatePostModalProps) {
  const { token } = useAuth();
  const [subreddits, setSubreddits] = useState<Subreddit[]>([]);
  const [subredditId, setSubredditId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [postType, setPostType] = useState<"text" | "image">("text");
  const [image, setImage] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  const fetchSubreddits = async () => {
    setLoadingSubs(true);
    try {
      const response = await fetch("http://localhost:5000/api/subreddit");
      if (!response.ok) throw new Error("Failed to load communities.");
      const data = await response.json();
      const list = data.subreddits || [];
      setSubreddits(list);
      if (list.length > 0) {
        setSubredditId(list[0].id);
      } else {
        setSubredditId("");
      }
    } catch (err) {
      console.error("Error loading subreddits:", err);
    } finally {
      setLoadingSubs(false);
    }
  };

  // Fetch communities on mount
  useEffect(() => {
    Promise.resolve().then(() => {
      fetchSubreddits();
    });
  }, []);

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
    if (!subredditId) {
      setError("Please choose a community to post in.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const payload = {
        subreddit_id: subredditId,
        title,
        description,
        image: postType === "image" ? image : null,
      };

      const response = await fetch("http://localhost:5000/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create post.");
      }

      onPostCreated?.();
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
        className="w-full max-w-lg bg-white dark:bg-[#1a1a1b] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl relative flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
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
            Create a Post
          </h2>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Subreddit Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 px-1">Choose a community</label>
            {loadingSubs ? (
              <div className="text-xs text-zinc-500 py-2">Loading communities...</div>
            ) : subreddits.length === 0 ? (
              <div className="flex flex-col gap-2 p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">No communities exist yet.</p>
                <button
                  type="button"
                  onClick={onCreateCommunityClick}
                  className="text-xs font-bold text-orange-600 dark:text-orange-500 hover:underline cursor-pointer"
                >
                  Create a community
                </button>
              </div>
            ) : (
              <select
                value={subredditId}
                onChange={(e) => setSubredditId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all cursor-pointer"
              >
                {subreddits.map((sub) => (
                  <option key={sub.id} value={sub.id} className="bg-white dark:bg-[#1a1a1b]">
                    r/{sub.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Post Type Selector (Text / Image) */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={() => setPostType("text")}
              className={`flex-1 pb-3 text-center text-sm font-bold border-b-2 transition-all ${
                postType === "text"
                  ? "border-orange-600 text-orange-600 dark:border-orange-500 dark:text-orange-500"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              Post
            </button>
            <button
              type="button"
              onClick={() => setPostType("image")}
              className={`flex-1 pb-3 text-center text-sm font-bold border-b-2 transition-all ${
                postType === "image"
                  ? "border-orange-600 text-orange-600 dark:border-orange-500 dark:text-orange-500"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              Image
            </button>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 px-1">Title</label>
            <input
              type="text"
              required
              maxLength={300}
              placeholder="An interesting title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 px-1">Body Text</label>
            <textarea
              placeholder="What are your thoughts?"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 resize-none"
            />
          </div>

          {/* Image URL (Only for image type) */}
          {postType === "image" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 px-1">Image URL</label>
              <input
                type="url"
                required
                placeholder="https://example.com/image.png"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              "Post"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
