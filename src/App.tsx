import { useState } from "react";
import Header from "./components/Layout/Header/header";
import Home from "./Pages/Home";
import AuthModal from "./components/UI/AuthModal/AuthModal";
import CreateSubredditModal from "./components/UI/CreateSubredditModal/CreateSubredditModal";
import CreatePostModal from "./components/UI/CreatePostModal/CreatePostModal";

function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");
  
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [subredditModalOpen, setSubredditModalOpen] = useState(false);

  const [postsReloadKey, setPostsReloadKey] = useState(0);
  const [subredditsReloadKey, setSubredditsReloadKey] = useState(0);

  const handleOpenLogin = () => {
    setAuthModalTab("login");
    setAuthModalOpen(true);
  };

  const handleOpenSignup = () => {
    setAuthModalTab("signup");
    setAuthModalOpen(true);
  };

  const handlePostCreated = () => {
    setPostsReloadKey((prev) => prev + 1);
  };

  const handleSubredditCreated = () => {
    setSubredditsReloadKey((prev) => prev + 1);
  };

  const handleCreateCommunityClick = () => {
    setPostModalOpen(false);
    setSubredditModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-50 dark:bg-[#0b1416] transition-colors">
      <Header
        onLoginClick={handleOpenLogin}
        onSignupClick={handleOpenSignup}
        onCreatePostClick={() => setPostModalOpen(true)}
        onCreateSubredditClick={() => setSubredditModalOpen(true)}
      />
      <Home 
        postsReloadKey={postsReloadKey}
        subredditsReloadKey={subredditsReloadKey}
        onOpenCreateSubreddit={() => setSubredditModalOpen(true)}
        onOpenLogin={handleOpenLogin}
        onOpenCreatePost={() => setPostModalOpen(true)}
      />

      {/* Modals */}
      {authModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialTab={authModalTab}
        />
      )}
      {subredditModalOpen && (
        <CreateSubredditModal
          isOpen={subredditModalOpen}
          onClose={() => setSubredditModalOpen(false)}
          onSubredditCreated={handleSubredditCreated}
        />
      )}
      {postModalOpen && (
        <CreatePostModal
          isOpen={postModalOpen}
          onClose={() => setPostModalOpen(false)}
          onPostCreated={handlePostCreated}
          onCreateCommunityClick={handleCreateCommunityClick}
        />
      )}
    </div>
  );
}

export default App;
