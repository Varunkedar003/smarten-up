import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthPage } from "@/components/auth/AuthPage";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Dashboard } from "@/pages/Dashboard";
import { LearningGames } from "@/pages/LearningGames";
import { AIAssistant } from "@/pages/AIAssistant";
import { Progress } from "@/pages/Progress";
import { Achievements } from "@/pages/Achievements";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/learning" element={<DashboardLayout><LearningGames /></DashboardLayout>} />
          <Route path="/assistant" element={<DashboardLayout><AIAssistant /></DashboardLayout>} />
          <Route path="/progress" element={<DashboardLayout><Progress /></DashboardLayout>} />
          <Route path="/achievements" element={<DashboardLayout><Achievements /></DashboardLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;