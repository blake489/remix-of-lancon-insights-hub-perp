import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Calendar from "./pages/Calendar";
import Team from "./pages/Team";
import Projects from "./pages/Projects";
import Settings from "./pages/Settings";
import Weather from "./pages/Weather";
import Inbox from "./pages/Inbox";
import NotFound from "./pages/NotFound";
import SourceDataHome from "./pages/SourceDataHome";
import ManageForms from "./pages/ManageForms";
import FormBuilder from "./pages/FormBuilder";
import FormEntry from "./pages/FormEntry";
import DevelopmentDashboard from "./pages/DevelopmentDashboard";
import DevelopmentImport from "./pages/DevelopmentImport";
import Magic from "./pages/Magic";

import ClaimsManager from "./pages/ClaimsManager";
import ClaimsLedger from "./pages/ClaimsLedger";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/calendar" 
              element={
              <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/team" 
              element={
                <ProtectedRoute>
                  <Team />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/weather"
              element={
                <ProtectedRoute>
                  <Weather />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/inbox"
              element={
                <ProtectedRoute>
                  <Inbox />
                </ProtectedRoute>
              }
            />
            
            <Route path="/magic" element={<ProtectedRoute><Magic /></ProtectedRoute>} />
            <Route path="/claims" element={<ProtectedRoute><ClaimsManager /></ProtectedRoute>} />
            <Route path="/claims/ledger" element={<ProtectedRoute><ClaimsLedger /></ProtectedRoute>} />
            <Route path="/development" element={<ProtectedRoute><DevelopmentDashboard /></ProtectedRoute>} />
            <Route path="/development/import" element={<ProtectedRoute><DevelopmentImport /></ProtectedRoute>} />
            <Route path="/source-data" element={<ProtectedRoute><SourceDataHome /></ProtectedRoute>} />
            <Route path="/source-data/manage" element={<ProtectedRoute><ManageForms /></ProtectedRoute>} />
            <Route path="/source-data/manage/:formId" element={<ProtectedRoute><FormBuilder /></ProtectedRoute>} />
            <Route path="/source-data/form/:slug" element={<ProtectedRoute><FormEntry /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
