import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../hooks/useAuth";
import Button from "../Button/button";

interface Post {
  id: string;
  creator_id: string;
  subreddit_id: string;
  title: string;
  description: string;
  post_type: string;
  image?: string | null;
  created_at: string;
  username: string;
  subreddit_name: string;
  votes: number;
  comments: number;
}

interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  parent_comment_id: string | null;
  body: string;
  created_at: string;
  username: string;
}

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onCommentAdded?: (postId: string) => void;
  onLoginClick?: () => void;
}

export default function CommentsModal({
  isOpen,
  onClose,
  post,
  onCommentAdded,
  onLoginClick,
}: CommentsModalProps) {
  const { token, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);

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

  useEffect(() => {
    if (!isOpen) return;

    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:5000/api/comment/${post.id}`);
        if (!response.ok) throw new Error("Failed to load comments.");
        const data = await response.json();
        setComments(data.comments || []);
      } catch (err) {
        console.error("Error loading comments:", err);
        setError("Could not load comments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [isOpen, post.id]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setError(null);
    setSubmitLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          post_id: post.id,
          body: newComment,
          parent_comment_id: replyingTo ? replyingTo.id : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to post comment.");
      }

      setComments((prev) => [...prev, data.comment]);
      setNewComment("");
      setReplyingTo(null);
      onCommentAdded?.(post.id);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Something went wrong.";
      setError(errorMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const renderComments = (parentId: string | null = null, depth = 0) => {
    const replies = comments.filter(c => c.parent_comment_id === parentId);
    if (replies.length === 0) return null;
    
    return (
      <div className={`flex flex-col gap-4 ${depth > 0 ? 'ml-6 mt-1 border-l-2 border-zinc-100 dark:border-zinc-800/80 pl-3' : ''}`}>
        {replies.map(comment => (
          <div key={comment.id} className="flex flex-col gap-2">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">u/{comment.username}</span>
                  <span className="text-zinc-400 dark:text-zinc-600">•</span>
                  <span className="text-zinc-400 dark:text-zinc-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 font-light wrap-break-word whitespace-pre-line">
                  {comment.body}
                </p>
                {isAuthenticated && (
                  <div className="flex items-center gap-4 mt-0.5">
                    <button
                      onClick={() => setReplyingTo({ id: comment.id, username: comment.username })}
                      className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" /></svg>
                      Reply
                    </button>
                  </div>
                )}
              </div>
            </div>
            {renderComments(comment.id, depth + 1)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-white dark:bg-[#1a1a1b] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl relative flex flex-col gap-5 max-h-[85vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Post Summary header */}
        <div className="flex flex-col gap-2.5 border-b border-zinc-100 dark:border-zinc-800/80 pb-4 mt-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-[8px] text-white font-bold shrink-0">
              r/
            </span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              r/{post.subreddit_name}
            </span>
            <span>•</span>
            <span>Posted by u/{post.username}</span>
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>

          <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50 leading-snug">
            {post.title}
          </h2>

          {post.description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-300 font-light whitespace-pre-line">
              {post.description}
            </p>
          )}

          {post.post_type === "image" && post.image && (
            <div className="overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 max-h-[300px] flex items-center justify-center mt-1">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-full object-contain max-h-[300px]"
              />
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="flex flex-col gap-4 flex-1">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            Comments ({comments.length})
          </h3>

          {/* New Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {replyingTo && (
                <div className="flex items-center justify-between text-xs text-orange-600 dark:text-orange-500 bg-orange-50 dark:bg-orange-950/20 p-2 rounded-lg">
                  <span>Replying to u/{replyingTo.username}</span>
                  <button type="button" onClick={() => setReplyingTo(null)} className="font-bold cursor-pointer hover:underline">Cancel</button>
                </div>
              )}
              <textarea
                placeholder="What are your thoughts?"
                rows={3}
                required
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 resize-none"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={submitLoading || !newComment.trim()}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-1.5! px-5! text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {submitLoading ? "Commenting..." : "Comment"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center flex flex-col items-center gap-2">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Log in or sign up to leave a comment.</p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLoginClick?.();
                }}
                className="text-xs font-bold text-orange-600 dark:text-orange-500 hover:underline cursor-pointer"
              >
                Log In / Sign Up
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Comments List */}
          <div className="flex flex-col gap-4 mt-2 max-h-[300px] overflow-y-auto pr-1">
            {loading ? (
              <div className="text-center text-xs text-zinc-500 py-6">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-center text-xs text-zinc-500 py-6 italic">No comments yet. Be the first to share your thoughts!</div>
            ) : (
              renderComments(null)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
