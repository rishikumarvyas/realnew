import React from "react";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import { useAuth } from "@/contexts/AuthContext";

const AuthModal = () => {
  const { showAuthModal, modalType, closeAuthModal, openLoginModal, openSignupModal } = useAuth();

  // If modal is not visible, don't render anything
  if (!showAuthModal) return null;

  // Create handlers for switching between login and signup modals
  const switchToLogin = (e) => {
    e.preventDefault(); // Prevent default link navigation
    openLoginModal();
  };

  const switchToSignup = (e) => {
    e.preventDefault(); // Prevent default link navigation
    openSignupModal();
  };

  return (
    <div className="fixed inset-0 z-50">
      {modalType === "login" && (
        <Login 
          onClose={closeAuthModal} 
          onSwitchToSignup={switchToSignup} // Pass the handler
        />
      )}
      {modalType === "signup" && (
        <Signup 
          onClose={closeAuthModal} 
          onSwitchToLogin={switchToLogin} // Pass the handler
        />
      )}
    </div>
  );
};

export default AuthModal;