import { useState, useEffect, useRef } from "react";
import Button from "../Button/button";
import DropdownIcon from "../../../assets/DropDownIcon/dropdownicon";

interface DropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  buttonClassName?: string;
}

export default function Dropdown({
  options,
  value,
  onChange,
  buttonClassName = "",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) { //close the dropdown if clicked outside
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Button
        onClick={() => setIsOpen((prev) => !prev)}
        className={buttonClassName}
      >
        {value} <DropdownIcon />
      </Button>
      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 rounded-xl bg-white dark:bg-[#1a1a1b] border border-gray-200 dark:border-zinc-700 shadow-lg py-1.5 z-50">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 cursor-pointer
                ${
                  value === option
                    ? "bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-semibold"
                    : "text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
