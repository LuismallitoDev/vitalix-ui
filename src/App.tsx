import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GlobalProvider } from "./context/GlobalContext";
// Components
import Login from "./pages/Login";
import Store from "./pages/Store";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPass";
import ProtectedRoute from "./components/ProtectedRoute";

// Create the client outside the component to prevent recreation on renders
const queryClient = new QueryClient();

const App = () => {
  // LOGIC FIX: No useQuery here. App isn't wrapped in the provider yet.

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Wrap everything in GlobalProvider so all pages can access filters/state */}
        <GlobalProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Store />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"/>} />
              <Route path="/reset-password" element={<ForgotPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </GlobalProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;