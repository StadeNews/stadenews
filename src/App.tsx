import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import HomePage from "./pages/HomePage";
import NewsPage from "./pages/NewsPage";
import StoryPage from "./pages/StoryPage";
import KategorienPage from "./pages/KategorienPage";
import SendenPage from "./pages/SendenPage";
import ChatPage from "./pages/ChatPage";
import ChatGroupsPage from "./pages/ChatGroupsPage";
import GroupChatPage from "./pages/GroupChatPage";
import ProfilePage from "./pages/ProfilePage";
import PublicProfilePage from "./pages/PublicProfilePage";
import StatusCenterPage from "./pages/StatusCenterPage";
import UeberUnsPage from "./pages/UeberUnsPage";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import ImpressumPage from "./pages/ImpressumPage";
import DatenschutzPage from "./pages/DatenschutzPage";
import AGBPage from "./pages/AGBPage";
import CookiesPage from "./pages/CookiesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/story/:id" element={<StoryPage />} />
            <Route path="/kategorien" element={<KategorienPage />} />
            <Route path="/senden" element={<SendenPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/gruppen" element={<ChatGroupsPage />} />
            <Route path="/gruppen/:id" element={<GroupChatPage />} />
            <Route path="/profil" element={<ProfilePage />} />
            <Route path="/profile/:username" element={<PublicProfilePage />} />
            <Route path="/status" element={<StatusCenterPage />} />
            <Route path="/ueber-uns" element={<UeberUnsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/impressum" element={<ImpressumPage />} />
            <Route path="/datenschutz" element={<DatenschutzPage />} />
            <Route path="/agb" element={<AGBPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
