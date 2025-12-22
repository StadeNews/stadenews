import { ReactNode } from "react";
import { TopNavbar } from "./TopNavbar";
import { MobileBottomNav } from "./MobileBottomNav";
import { Footer } from "../shared/Footer";

interface MainLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export const MainLayout = ({ children, showFooter = true }: MainLayoutProps) => {
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
