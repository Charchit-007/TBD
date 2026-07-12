import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export default function button({
  children,
  onClick,
  className = 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
  type = 'button',
  ...props
}: ButtonProps){
  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        inline-block px-4 py-2.5 text-center font-semibold text-sm
        rounded-4xl cursor-pointer select-none
        active:scale-[0.98] 
        focus-visible:outline-2 dark:focus-visible:outline-white focus-visible:outline-black 
        transition-all duration-200 ease-in-out
        border-none
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}