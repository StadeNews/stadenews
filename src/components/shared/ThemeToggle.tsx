import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle = ({ showLabel = false, className = '' }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-all duration-200 min-h-[44px] ${className}`}
      aria-label={theme === 'light' ? 'Dunkelmodus aktivieren' : 'Hellmodus aktivieren'}
    >
      {theme === 'light' ? (
        <>
          <Moon className="w-5 h-5" />
          {showLabel && <span className="font-medium">Dunkelmodus</span>}
        </>
      ) : (
        <>
          <Sun className="w-5 h-5" />
          {showLabel && <span className="font-medium">Hellmodus</span>}
        </>
      )}
    </button>
  );
};