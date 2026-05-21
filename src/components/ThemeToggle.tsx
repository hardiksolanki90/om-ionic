import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/cn';

export default function ThemeToggle({ className, iconSize = 16 }: { className?: string, iconSize?: number }) {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        "flex items-center justify-center rounded-lg p-2 transition-all duration-200",
        "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
        "dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800",
        className
      )}
      title={`Theme: ${theme}. Click to cycle (light → dark → system)`}
      aria-label={`Switch theme (current: ${theme})`}
    >
      {theme === 'light' && <Sun size={iconSize} strokeWidth={2} />}
      {theme === 'dark' && <Moon size={iconSize} strokeWidth={2} />}
      {theme === 'system' && <Monitor size={iconSize} strokeWidth={2} />}
    </button>
  );
}
