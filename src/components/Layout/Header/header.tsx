import Button from "../../UI/Button/button";
import Searchbar from "../../UI/SearchBar/searchbar";
import { ThemeToggle } from "../../UI/ThemeToggle/ThemeToggle";
import { useAuth } from "../../../hooks/useAuth";

interface HeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onCreatePostClick: () => void;
  onCreateSubredditClick: () => void;
}

export default function Header({
  onLoginClick,
  onSignupClick,
  onCreatePostClick,
  onCreateSubredditClick,
}: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="flex justify-between items-center border-b dark:border-zinc-800 border-zinc-200 bg-white dark:bg-[#0b1416] px-6 py-2.5 w-full sticky top-0 z-40 transition-colors">
      {/* Left side: Logo */}
      <div className="flex-1 dark:text-white text-orange-600 text-3xl font-semibold cursor-pointer">
        <p> reddit</p>
      </div>

      {/* Center: Search Bar */}
      <Searchbar />

      {/* Right side: Session / Actions */}
      <div className="flex-1 flex justify-end items-center gap-3">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            {/* Create Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={onCreateSubredditClick}
                title="Create Community"
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
              </button>

              <Button
                onClick={onCreatePostClick}
                className="bg-orange-600 hover:bg-orange-700 text-white py-1.5! px-4! text-xs font-bold flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create
              </Button>
            </div>

            {/* User Profile Info */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-zinc-200 dark:border-zinc-800">
              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 overflow-hidden shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <div className="flex flex-col text-left md:block">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  u/{user.username}
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Redditor
                </span>
              </div>
            </div>

            {/* Logout */}
            <Button
              onClick={logout}
              className="dark:bg-[#2a3236] dark:hover:bg-[#323c40] hover:bg-zinc-200 bg-zinc-100 text-zinc-800 dark:text-zinc-200 py-1.5! px-3.5! text-xs font-bold"
            >
              Log Out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              onClick={onSignupClick}
              className="dark:bg-[#2a3236] dark:hover:bg-[#323c40] hover:bg-zinc-200 bg-zinc-100 text-zinc-800 dark:text-zinc-200 py-1.5! px-4! text-xs font-bold"
            >
              Sign Up
            </Button>
            <Button
              onClick={onLoginClick}
              className="bg-orange-600 hover:bg-orange-700 text-white py-1.5! px-4! text-xs font-bold"
            >
              Log In
            </Button>
          </div>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}