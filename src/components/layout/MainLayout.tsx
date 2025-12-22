import { ReactNode } from "react";
import { TopNavbar } from "./TopNavbar";
import { MobileBottomNav } from "./MobileBottomNav";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <TopNavbar />
      <main className="pt-16 pb-20 md:pb-8">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
};
