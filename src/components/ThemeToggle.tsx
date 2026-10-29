import React from 'react';
import { Moon } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export const ThemeToggle: React.FC = () => {
  const toggleTheme = useGameStore((state) => state.toggleTheme);

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 font-heading text-xs md:text-sm border-2 border-black rounded-lg transition-all select-none bg-white text-black shadow-[3px_3px_0px_#111111] hover:bg-neutral-100 active:translate-x-0.5 active:translate-y-0.5"
      aria-label="Toggle dark mode"
      title="Enter Dark Mode"
    >
      <Moon className="w-4 h-4 text-purple-600" />
      <span>DARK MODE</span>
    </button>
  );
};
