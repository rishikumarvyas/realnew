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

// Initialize QueryClient with better caching options
const queryClient = new QueryClient({   
  defaultOptions: {     
    queries: {       
      refetchOnWindowFocus: false,       
      staleTime: 5 * 60 * 1000, // 5 minutes     
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
              
              <Route element={<ProtectedRoute />}>             
                <Route path="/admin" element={<AdminPage />} />    
                <Route path="dashboard" element={<Dashboard />} />                 
                <Route path="post-property" element={<PostProperty />} />                 
                <Route path="/edit-property/:propertyId" element={<EditProperty />} />               
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