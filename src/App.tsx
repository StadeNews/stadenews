import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useSearchParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { CookieConsent } from "@/components/shared/CookieConsent";
import HomePage from "./pages/HomePage";
import NewsPage from "./pages/NewsPage";
import StoryPage from "./pages/StoryPage";
import KategorienPage from "./pages/KategorienPage";
import SendenPage from "./pages/SendenPage";
import MeineEinsendungenPage from "./pages/MeineEinsendungenPage";
import ChatPage from "./pages/ChatPage";
import ChatGroupsPage from "./pages/ChatGroupsPage";
import GroupChatPage from "./pages/GroupChatPage";
import SpottedPage from "./pages/SpottedPage";
import SpottedDetailPage from "./pages/SpottedDetailPage";
import ProfilePage from "./pages/ProfilePage";
import PublicProfilePage from "./pages/PublicProfilePage";
import StatusCenterPage from "./pages/StatusCenterPage";
import UeberUnsPage from "./pages/UeberUnsPage";
import UpdatesPage from "./pages/UpdatesPage";
import AdminPage from "./pages/AdminPage";
import AdminStatsPage from "./pages/AdminStatsPage";
import AuthPage from "./pages/AuthPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ImpressumPage from "./pages/ImpressumPage";
import DatenschutzPage from "./pages/DatenschutzPage";
import AGBPage from "./pages/AGBPage";
import CookiesPage from "./pages/CookiesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// GitHub Pages SPA redirect handler
const GitHubPagesRedirect = () => {
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('p');
  
  if (redirectPath) {
    return <Navigate to={decodeURIComponent(redirectPath)} replace />;
  }
  return null;
};

const AppRoutes = () => {
  const [searchParams] = useSearchParams();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const redirectPath = searchParams.get('p');

  useEffect(() => {
    if (redirectPath) {
      setShouldRedirect(true);
    }
  }, [redirectPath]);

  if (shouldRedirect && redirectPath) {
    return <Navigate to={decodeURIComponent(redirectPath)} replace />;
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/story/:id" element={<StoryPage />} />
        <Route path="/kategorien" element={<KategorienPage />} />
        <Route path="/senden" element={<SendenPage />} />
        <Route path="/meine-einsendungen" element={<MeineEinsendungenPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/gruppen" element={<ChatGroupsPage />} />
        <Route path="/gruppen/:id" element={<GroupChatPage />} />
        <Route path="/spotted" element={<SpottedPage />} />
        <Route path="/spotted/:id" element={<SpottedDetailPage />} />
        <Route path="/profil" element={<ProfilePage />} />
        <Route path="/profile/:username" element={<PublicProfilePage />} />
        <Route path="/status" element={<StatusCenterPage />} />
        <Route path="/ueber-uns" element={<UeberUnsPage />} />
        <Route path="/updates" element={<UpdatesPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/stats" element={<AdminStatsPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/impressum" element={<ImpressumPage />} />
        <Route path="/datenschutz" element={<DatenschutzPage />} />
        <Route path="/agb" element={<AGBPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <CookieConsent />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
