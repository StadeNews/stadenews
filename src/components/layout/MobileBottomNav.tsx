import { Link, useLocation } from "react-router-dom";
import { Home, Newspaper, Send, Heart, Users, User, Shield, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export const MobileBottomNav = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/news", icon: Newspaper, label: "News" },
    { href: "/spotted", icon: Heart, label: "Spotted" },
    { href: "/senden", icon: Send, label: "Senden" },
    { href: "/gruppen", icon: Users, label: "Gruppen" },
    { href: "/status", icon: Activity, label: "Status" },
    user ? { href: "/profil", icon: User, label: "Profil" } : null,
    ...(isAdmin ? [{ href: "/admin", icon: Shield, label: "Admin" }] : []),
  ].filter(Boolean);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-card border-t border-border/30 pb-safe">
      <ul className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          if (!item) return null;
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <li key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "p-1 rounded-lg transition-all duration-200",
                  isActive && "bg-primary/20 neon-glow-sm"
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
