import { Link, useLocation } from "react-router-dom";
import { Home, Newspaper, FolderOpen, Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/news", icon: Newspaper, label: "News" },
  { href: "/kategorien", icon: FolderOpen, label: "Kategorien" },
  { href: "/senden", icon: Send, label: "Senden" },
  { href: "/chat", icon: MessageCircle, label: "Chat" },
];

export const MobileBottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-card border-t border-border/30 pb-safe">
      <ul className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <li key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-200",
                  isActive && "bg-primary/20 neon-glow-sm"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
