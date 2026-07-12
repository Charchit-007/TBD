import RedditIcon from "../../../assets/RedditIcon/redditicon";

function searchbar() {
  return (
    <div className="relative flex items-center w-1/3 pt-1 pb-1">
      <div className="absolute w-7 ml-2 flex items-center justify-center pointer-events-none">
        <RedditIcon />
      </div>
      <div className="p-px bg-linear-to-r from-orange-600 to-orange-400 rounded-full w-full">
        <input
          type="text"
          placeholder="Find Anything"
          className="bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 placeholder-zinc-500 dark:placeholder-zinc-400 rounded-full text-zinc-900 dark:text-white text-center text-sm py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-zinc-800 dark:focus:ring-white transition-colors duration-200"
        />
      </div>
    </div>
  );
}

export default searchbar;

