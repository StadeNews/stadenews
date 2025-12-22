import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Newspaper, Send, Heart, Users, User, Shield, Activity, MoreHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export const MobileBottomNav = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const [showMore, setShowMore] = useState(false);

  // Main items always visible (max 5)
  const mainItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/news", icon: Newspaper, label: "News" },
    { href: "/spotted", icon: Heart, label: "Spotted" },
    { href: "/senden", icon: Send, label: "Senden" },
  ];

  // Additional items in "More" menu
  const moreItems = [
    { href: "/gruppen", icon: Users, label: "Gruppen" },
    { href: "/status", icon: Activity, label: "Status" },
    ...(user ? [{ href: "/profil", icon: User, label: "Profil" }] : []),
    ...(isAdmin ? [{ href: "/admin", icon: Shield, label: "Admin" }] : []),
  ];

  const isInMoreItems = moreItems.some(item => location.pathname === item.href);

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
          <div className="absolute bottom-20 left-4 right-4 glass-card p-4 animate-scale-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Mehr</span>
              <button onClick={() => setShowMore(false)} className="p-1 hover:bg-secondary rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {moreItems.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setShowMore(false)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-xl transition-all",
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-card border-t border-border/30 pb-safe">
        <ul className="flex items-center justify-around h-16">
          {mainItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200",
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
          
          {/* More Button */}
          <li>
            <button
              onClick={() => setShowMore(!showMore)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200",
                (showMore || isInMoreItems)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-all duration-200",
                (showMore || isInMoreItems) && "bg-primary/20 neon-glow-sm"
              )}>
                <MoreHorizontal className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">Mehr</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
};
