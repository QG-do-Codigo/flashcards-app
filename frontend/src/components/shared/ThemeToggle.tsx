import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-8 rounded-full transition-all duration-300"
      style={{ backgroundColor: theme === 'dark' ? 'var(--primary)' : 'var(--border-light)' }}
      aria-label="Toggle theme"
    >
      <div
        className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white flex items-center justify-center transition-transform duration-300"
        style={{ transform: theme === 'dark' ? 'translateX(24px)' : 'translateX(0)' }}
      >
        {theme === 'dark' ? (
          <Moon className="w-4 h-4" style={{ color: 'var(--primary)' }} />
        ) : (
          <Sun className="w-4 h-4 text-yellow-500" />
        )}
      </div>
    </button>
  );
}
