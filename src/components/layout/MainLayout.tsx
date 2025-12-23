import { ReactNode } from "react";
import { TopNavbar } from "./TopNavbar";
import { MobileBottomNav } from "./MobileBottomNav";
import { Footer } from "../shared/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useBadgeNotifications } from "@/hooks/useBadgeNotifications";

interface MainLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export const MainLayout = ({ children, showFooter = true }: MainLayoutProps) => {
  const { user } = useAuth();
  
  // Check for badge notifications on app load
  useBadgeNotifications(user?.id);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavbar />
      <main className="flex-1 pt-16 pb-20 md:pb-8">
        {children}
      </main>
      {showFooter && <Footer />}
      <MobileBottomNav />
    </div>
  );
};
