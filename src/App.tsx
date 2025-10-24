import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AboutUs from "./pages/About";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PropertyListing from "./pages/PropertyListing";
import PropertyDetail from "./pages/PropertyDetail";
import PostProperty from "./pages/PostProperty";
import EditProperty from "./pages/EditProperty";
import NotFound from "./pages/NotFound";
import { Layout } from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import ContactUs from "./pages/ContactUs";
import AdminPage from "./pages/AdminPage";
import ScrollToTop from "./components/ScrollToTop";
import AuthModal from "./components/AuthModal"; // Import the AuthModal component
import BuilderProjectPost from "./pages/BuilderProjectPost";
import NewLanching from "./pages/newlanching";
import BuilderPropertyDetail from "./pages/BuilderPropertyDetail";
import Profile from "./pages/Profile";
import GetBuilder from "./pages/GetBuilder";
import GetProject from "./pages/GetProject";
import ProjectDetail from "./pages/ProjectDetail";
import UpdateProject from "./pages/UpdateProject";
import AddProject from "./pages/AddProject";
import GetProjectAPI from "./pages/GetProjectAPI";
import ProjectDetailAPI from "./pages/ProjectDetailAPI";

// Initialize QueryClient with better caching options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutes - increased from 5 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes - garbage collection time (replaces cacheTime in v5)
      retry: 1, // Reduce retry attempts
      retryDelay: 1000, // 1 second delay between retries
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          {/* Auth Modal component that overlays on top of any page */}
          <AuthModal />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="contactus" element={<ContactUs />} />
              <Route path="about" element={<AboutUs />} />
              <Route path="terms" element={<TermsAndConditions />} />
              <Route path="privacy" element={<PrivacyPolicy />} />

              {/* Redirect login/signup routes to home with modal */}
              <Route path="login" element={<Navigate to="/" replace />} />
              <Route path="signup" element={<Navigate to="/" replace />} />

              <Route path="properties" element={<PropertyListing />} />
              <Route path="properties/:id" element={<PropertyDetail />} />
              <Route path="builderpost" element={<BuilderProjectPost />} />
              <Route path="builder-project-post" element={<BuilderProjectPost />} />
              <Route path="builder/:builderId" element={<GetBuilder />} />
              <Route path="project/:projectId" element={<GetProject />} />
              <Route path="get-project" element={<GetProject />} />
              <Route path="get-project-api" element={<GetProjectAPI />} />
              <Route path="project-detail/:projectId" element={<ProjectDetail />} />
              <Route path="project-detail-api/:projectId" element={<ProjectDetailAPI />} />
              <Route path="update-project/:projectId" element={<UpdateProject />} />
              <Route
                path="builder-property/:id"
                element={<BuilderPropertyDetail />}
              />

              <Route element={<ProtectedRoute />}>
                <Route path="profile" element={<Profile />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="post-property" element={<PostProperty />} />
                <Route path="newlanching" element={<NewLanching />} />
                <Route path="add-project" element={<AddProject />} />
                <Route
                  path="/edit-property/:propertyId"
                  element={<EditProperty />}
                />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
