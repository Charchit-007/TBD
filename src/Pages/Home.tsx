import { useState, useEffect, useRef, useCallback } from "react";
import Dropdown from "../components/UI/Dropdown/Dropdown";
import Button from "../components/UI/Button/button";
import LikeButton from "../components/UI/LikeButton/likebutton";
import CommentsModal from "../components/UI/CommentsModal/CommentsModal";
import { useAuth } from "../hooks/useAuth";

const buttonStyle = "dark:hover:bg-[#424242] hover:bg-gray-300 text-gray-500 inline-flex items-center !py-2 !px-2.5 !text-xs";

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
  user_vote?: number;
}

interface Subreddit {
  id: string;
  name: string;
  category: string;
}

interface HomeProps {
  postsReloadKey: number;
  subredditsReloadKey: number;
  onOpenCreateSubreddit: () => void;
  onOpenLogin: () => void;
  onOpenCreatePost: () => void;
}

export default function Home({
  postsReloadKey,
  subredditsReloadKey,
  onOpenCreateSubreddit,
  onOpenLogin,
  onOpenCreatePost,
}: HomeProps) {
  const { token, isAuthenticated } = useAuth();

  const [selectedSort, setSelectedSort] = useState("Best");
  const [selectedLocation, setSelectedLocation] = useState("Everywhere");
  const [selectedView, setSelectedView] = useState("Card");

  const [posts, setPosts] = useState<Post[]>([]);
  const [subreddits, setSubreddits] = useState<Subreddit[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCommentPost, setSelectedCommentPost] = useState<Post | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  const handleCommentAdded = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p
      )
    );
  };

  const handleShareClick = (post: Post) => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      setCopiedPostId(post.id);
      setTimeout(() => {
        setCopiedPostId(null);
      }, 2000);
    }).catch(err => {
      console.error("Failed to copy link: ", err);
    });
  };

  const mainRef = useRef<HTMLElement>(null);

  // Fetch subreddits (communities)
  useEffect(() => {
    fetch("http://localhost:5000/api/subreddit")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch communities");
        return res.json();
      })
      .then((data) => {
        setSubreddits(data.subreddits || []);
      })
      .catch((err) => {
        console.error("Error fetching communities:", err);
      });
  }, [subredditsReloadKey]);

  // Fetch initial posts (page 1)
  useEffect(() => {
    const initFetch = async () => {
      setLoading(true);
      setError(null);
      setNextCursor(null);

      const fetchUrl = isAuthenticated 
        ? "http://localhost:5000/api/feed?limit=10"
        : "http://localhost:5000/api/post";

      const headers: HeadersInit = {};
      if (isAuthenticated && token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      try {
        const res = await fetch(fetchUrl, { headers });
        if (!res.ok) {
          throw new Error("Failed to fetch posts from the backend");
        }
        const data = await res.json();
        setPosts(data.posts || []);
        setNextCursor(data.next_cursor || null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Something went wrong.";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    // Execute in microtask to avoid synchronous setState inside useEffect
    Promise.resolve().then(initFetch);
  }, [isAuthenticated, token, postsReloadKey]);

  // Fetch more posts for infinite scroll
  const fetchMorePosts = useCallback(async () => {
    if (!nextCursor || loadingMore || !isAuthenticated) return;
    setLoadingMore(true);

    try {
      const url = `http://localhost:5000/api/feed?limit=10&cursor=${encodeURIComponent(nextCursor)}`;
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed to load more posts.");
      
      const data = await res.json();
      setPosts((prev) => [...prev, ...(data.posts || [])]);
      setNextCursor(data.next_cursor || null);
    } catch (err) {
      console.error("Error loading more posts:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, isAuthenticated, token]);

  // Scroll handler for main container
  useEffect(() => {
    const handleScroll = () => {
      if (!mainRef.current || !isAuthenticated || !nextCursor || loadingMore) return;

      const { scrollTop, scrollHeight, clientHeight } = mainRef.current;
      if (scrollHeight - scrollTop - clientHeight < 100) {
        fetchMorePosts();
      }
    };

    const container = mainRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [nextCursor, loadingMore, isAuthenticated, fetchMorePosts]);

  return (
    <div className="flex-1 min-h-0 overflow-hidden bg-zinc-50 dark:bg-[#0b1416] text-zinc-900 dark:text-zinc-100 transition-colors">
      <div className="max-w-full mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[250px_1fr_510px] gap-y-5 gap-x-3 h-full">
        
        {/* Left Sidebar — fixed, not scrollable */}
        <div className="hidden md:flex w-full flex-col gap-6 border-r border-zinc-200 dark:border-zinc-800/80 overflow-y-auto no-scrollbar">
          {/* Navigation Feeds */}
          <div className="flex flex-col gap-1">
            <h3 className="px-3 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
              Feeds
            </h3>
            <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors text-left w-full cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-orange-600 dark:text-orange-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <span>Home</span>
            </button>
            <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 transition-colors text-left w-full cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z" />
              </svg>
              <span>Popular</span>
            </button>
            <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 transition-colors text-left w-full cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-.778.099-1.533.284-2.253m0 0A17.919 17.919 0 0 0 12 10.5a17.918 17.918 0 0 0 8.716-2.247" />
              </svg>
              <span>All</span>
            </button>
          </div>

          {/* Communities */}
          <div className="flex flex-col gap-1">
            <h3 className="px-3 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
              Communities
            </h3>
            {subreddits.length === 0 ? (
              <p className="px-3 py-2 text-xs text-zinc-500 italic">No communities yet</p>
            ) : (
              subreddits.map((sub) => (
                <button
                  key={sub.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 transition-colors text-left w-full cursor-pointer truncate"
                >
                  <span className="w-5 h-5 shrink-0 rounded-full bg-cyan-500 flex items-center justify-center text-[10px] text-white font-bold">
                    r/
                  </span>
                  <span className="truncate">r/{sub.name}</span>
                </button>
              ))
            )}

            {isAuthenticated && (
              <button
                onClick={onOpenCreateSubreddit}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-orange-600 dark:text-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-950/10 transition-colors text-left w-full cursor-pointer mt-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Create Community</span>
              </button>
            )}
          </div>

          {/* Resources Info */}
          <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col gap-2 px-3 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              <a href="#" className="hover:underline">Content Policy</a>
              <span>•</span>
              <a href="#" className="hover:underline">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:underline">User Agreement</a>
            </div>
            <div>© 2026 Reddit, Inc. All rights reserved</div>
          </div>
        </div>

        {/* Middle Section — only this scrolls */}
        <main ref={mainRef} className="flex flex-col gap-4 min-w-0 overflow-y-auto no-scrollbar md:pl-4 lg:pl-48 lg:pr-5">
          {/* Create Post Bar */}
          <div 
            onClick={isAuthenticated ? onOpenCreatePost : onOpenLogin}
            className="bg-white dark:bg-[#1a1a1b] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-xs mt-1"
          >
            <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center text-zinc-400 dark:text-zinc-500 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5.5 h-5.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <input
              type="text"
              readOnly
              placeholder="Create Post"
              className="flex-1 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 cursor-pointer transition-colors focus:outline-hidden"
            />
            <button className="p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5.5 h-5.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </button>
          </div>

          {/* Dropdown Filters Toolbar */}
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-2 mb-2">
            <div className="flex items-center">
              <Dropdown
                options={["Best", "Hot", "New", "Top", "Rising"]}
                value={selectedSort}
                onChange={setSelectedSort}
                buttonClassName={buttonStyle}
              />
              <Dropdown
                options={["Everywhere", "United States", "United Kingdom", "Canada", "Australia"]}
                value={selectedLocation}
                onChange={setSelectedLocation}
                buttonClassName={buttonStyle}
              />
              <Dropdown
                options={["Card", "Classic", "Compact"]}
                value={selectedView}
                onChange={setSelectedView}
                buttonClassName={buttonStyle}
              />
            </div>
          </div>

          {/* Feed Content */}
          <div className="flex flex-col gap-4">
            {loading && (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-white dark:bg-[#1a1a1b] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
                      <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                      <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                    </div>
                    <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                    <div className="h-10 w-full bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-sm flex flex-col gap-2">
                <p className="font-semibold text-base">Could not load posts: {error}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Make sure your Express backend is running (typically on port 5000) and CORS is enabled.</p>
              </div>
            )}

            {!loading && !error && posts.map((post) => (
              <article key={post.id} className="bg-white dark:bg-[#1a1a1b] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                    r/
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 hover:underline cursor-pointer">
                    r/{post.subreddit_name}
                  </span>
                  <span>•</span>
                  <span>Posted by u/{post.username}</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50 leading-snug hover:text-orange-600 dark:hover:text-orange-500 transition-colors cursor-pointer">
                    {post.title}
                  </h2>
                  {post.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-light whitespace-pre-line">
                      {post.description}
                    </p>
                  )}
                  {post.post_type === "image" && post.image && (
                    <div className="mt-2 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 max-h-[450px] flex items-center justify-center">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-contain max-h-[450px]"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 mt-1">
                  <LikeButton 
                    initialVotes={post.votes || 0} 
                    postId={post.id} 
                    initialUserVote={post.user_vote === 1 ? "up" : post.user_vote === -1 ? "down" : null} 
                  />

                  <button 
                    onClick={() => setSelectedCommentPost(post)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-xs font-semibold text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025 4.486 4.486 0 0 0-.471-3.127C3.576 14.41 3 13.266 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                    </svg>
                    <span>{post.comments || 0} Comments</span>
                  </button>

                  <button 
                    onClick={() => handleShareClick(post)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-xs font-semibold text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                    </svg>
                    <span>{copiedPostId === post.id ? "Link Copied!" : "Share"}</span>
                  </button>
                </div>
              </article>
            ))}

            {/* Infinite Scroll loading indicators */}
            {loadingMore && (
              <div className="animate-pulse bg-white dark:bg-[#1a1a1b] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
                  <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                </div>
                <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
              </div>
            )}

            {!loading && !error && posts.length > 0 && isAuthenticated && !nextCursor && (
              <div className="text-center text-xs text-zinc-500 py-6">
                You've reached the end of the feed.
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar — fixed, not scrollable */}
        <div className="hidden lg:flex flex-col gap-6 overflow-y-auto no-scrollbar mr-45">
          {/* Reddit Home Info & Creation Actions Card */}
          <div className="bg-zinc-100 dark:bg-[#1a1a1b] rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 overflow-hidden shadow-sm flex flex-col">
            <div className="h-12 bg-orange-600/10 dark:bg-orange-600/5 relative">
              <div className="absolute -bottom-4 left-4 w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </div>
            </div>
            <div className="px-4 pt-6 pb-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Home</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
                  Your personal Reddit frontpage. Come here to check in with your favorite communities.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800/80">
                <Button 
                  onClick={isAuthenticated ? onOpenCreatePost : onOpenLogin}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 text-xs transition-colors"
                >
                  Create Post
                </Button>
                <Button 
                  onClick={isAuthenticated ? onOpenCreateSubreddit : onOpenLogin}
                  className="w-full bg-transparent border border-zinc-300 hover:bg-zinc-200/50 dark:border-zinc-700 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold py-2 text-xs transition-colors"
                >
                  Create Community
                </Button>
              </div>
            </div>
          </div>

          {/* Popular Communities Card */}
          <div className="bg-zinc-100 dark:bg-[#1a1a1b] rounded-2xl p-4 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
              Popular Communities
            </h3>
            <div className="flex flex-col gap-3">
              {subreddits.length === 0 ? (
                // Fallback Mock items if database is empty
                [
                  { name: "r/AskReddit", category: "General", bg: "bg-red-500" },
                  { name: "r/gaming", category: "Gaming", bg: "bg-purple-500" },
                  { name: "r/pics", category: "Photos", bg: "bg-yellow-500" },
                  { name: "r/science", category: "Science & tech", bg: "bg-emerald-500" },
                ].map((sub, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full ${sub.bg} flex items-center justify-center text-xs text-white font-bold shadow-sm`}>
                        {sub.name.substring(2, 3).toUpperCase()}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:underline cursor-pointer">{sub.name}</span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{sub.category}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Live Communities from backend database
                subreddits.slice(0, 5).map((sub, i) => {
                  const colors = ["bg-red-500", "bg-purple-500", "bg-yellow-500", "bg-emerald-500", "bg-blue-500"];
                  const bg = colors[i % colors.length];
                  return (
                    <div key={sub.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center text-xs text-white font-bold shadow-sm`}>
                          {sub.name.substring(0, 1).toUpperCase()}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:underline cursor-pointer">r/{sub.name}</span>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{sub.category}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <Button className="py-2 px-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs transition-colors self-start">
              See more
            </Button>
          </div>
        </div>
      </div>

      {selectedCommentPost && (
        <CommentsModal
          isOpen={!!selectedCommentPost}
          onClose={() => setSelectedCommentPost(null)}
          post={selectedCommentPost}
          onCommentAdded={handleCommentAdded}
          onLoginClick={onOpenLogin}
        />
      )}
    </div>
  );
}
