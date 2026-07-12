import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";

interface LikeButtonProps {
  initialVotes?: number;
  postId?: string;
  initialUserVote?: "up" | "down" | null;
}

export default function LikeButton({ initialVotes = 0, postId, initialUserVote = null }: LikeButtonProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(initialUserVote);
  const { token, isAuthenticated } = useAuth();

  const handleVoteApi = async (value: number) => {
    if (!postId || !isAuthenticated) return;
    try {
      await fetch("http://localhost:5000/api/vote/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, value }),
      });
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  const handleUpvote = () => {
    if (userVote === "up") {
      setUserVote(null);
      setVotes(votes - 1);
      handleVoteApi(0);
    } else {
      const diff = userVote === "down" ? 2 : 1;
      setUserVote("up");
      setVotes(votes + diff);
      handleVoteApi(1);
    }
  };

  const handleDownvote = () => {
    if (userVote === "down") {
      setUserVote(null);
      setVotes(votes + 1);
      handleVoteApi(0);
    } else {
      const diff = userVote === "up" ? 2 : 1;
      setUserVote("down");
      setVotes(votes - diff);
      handleVoteApi(-1);
    }
  };

  return (
    <div className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 rounded-full px-2 py-1 transition-colors">
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleUpvote();
        }}
        className={`p-1 rounded-full hover:bg-zinc-300/50 dark:hover:bg-zinc-600/50 transition-colors ${
          userVote === "up"
            ? "text-orange-600 dark:text-orange-500"
            : "text-zinc-500 dark:text-zinc-400"
        }`}
        aria-label="Upvote"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18"
          />
        </svg>
      </button>

      <span
        className={`text-xs font-bold px-1 min-w-[16px] text-center select-none ${
          userVote === "up"
            ? "text-orange-600 dark:text-orange-500"
            : userVote === "down"
            ? "text-blue-600 dark:text-blue-500"
            : "text-zinc-700 dark:text-zinc-300"
        }`}
      >
        {votes}
      </span>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDownvote();
        }}
        className={`p-1 rounded-full hover:bg-zinc-300/50 dark:hover:bg-zinc-600/50 transition-colors ${
          userVote === "down"
            ? "text-blue-600 dark:text-blue-500"
            : "text-zinc-500 dark:text-zinc-400"
        }`}
        aria-label="Downvote"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 17.25 12 21m0 0-3.75-3.75M12 21V3"
          />
        </svg>
      </button>
    </div>
  );
}
