import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../hooks/useAuth";
import Button from "../Button/button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, initialTab = "login" }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">(initialTab);
  const { login } = useAuth();
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // Handle Close on Escape key press
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

    const url = tab === "login" 
      ? "http://localhost:5000/api/auth/login" 
      : "http://localhost:5000/api/auth/register";

    const payload = tab === "login" 
      ? { email, password } 
      : { username, email, password };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      // Successful Auth
      login(data.token, data.user);
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to connect to the server.";
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="w-full max-w-md bg-white dark:bg-[#1a1a1b] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl relative flex flex-col gap-6 transform transition-all duration-300 scale-100"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header/Tabs */}
        <div className="flex flex-col gap-2 text-center mt-2">
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">
            {tab === "login" ? "Log In to Reddit" : "Sign Up for Reddit"}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            By continuing, you agree to our User Agreement and acknowledge that you understand the Privacy Policy.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {tab === "signup" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 px-1">Username</label>
              <input
                type="text"
                required
                placeholder="u/username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 px-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 px-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              tab === "login" ? "Log In" : "Sign Up"
            )}
          </Button>
        </form>

        {/* Tab Toggle */}
        <div className="text-center text-sm text-zinc-600 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
          {tab === "login" ? (
            <p>
              New to Reddit?{" "}
              <button 
                onClick={() => { setTab("signup"); setError(null); }}
                className="font-bold text-orange-600 dark:text-orange-500 hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already a redditor?{" "}
              <button 
                onClick={() => { setTab("login"); setError(null); }}
                className="font-bold text-orange-600 dark:text-orange-500 hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                Log In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
