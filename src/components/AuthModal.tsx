import React from "react";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import { useAuth } from "@/contexts/AuthContext";

const AuthModal = () => {
  const { showAuthModal, modalType, closeAuthModal } = useAuth();
  
  // If modal is not visible, don't render anything
  if (!showAuthModal) return null;
  
  return (
    <div className="fixed inset-0 z-50">
      {modalType === "login" && <Login onClose={closeAuthModal} />}
      {modalType === "signup" && <Signup onClose={closeAuthModal} />}
    </div>
  );
};

export default AuthModal;