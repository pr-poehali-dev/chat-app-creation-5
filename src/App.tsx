import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthScreen from "./components/AuthScreen";

const queryClient = new QueryClient();

function AppInner() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("volna_token");
    const savedUser = localStorage.getItem("volna_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setChecked(true);
  }, []);

  const handleAuth = (t: string, u: Record<string, unknown>, premium: boolean) => {
    setToken(t);
    setUser(u);
    setIsPremium(premium);
  };

  const handleLogout = () => {
    localStorage.removeItem("volna_token");
    localStorage.removeItem("volna_user");
    setToken(null);
    setUser(null);
    setIsPremium(false);
  };

  if (!checked) return null;

  if (!token) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index user={user} isPremium={isPremium} onLogout={handleLogout} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppInner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
