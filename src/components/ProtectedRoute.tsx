import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show a full-page loader while auth state is initializing
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl font-medium">
        Loading...
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, show protected content
  return <Outlet />;
};

export default ProtectedRoute;
