import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import NotificationIcon from "@/components/NotificationIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  X,
  User,
  LogOut,
  PlusCircle,
  Home,
  Building,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import hy from "../Images/hy1-removebg-preview.png";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    user, 
    isAuthenticated, 
    logout, 
    openLoginModal, 
    openSignupModal 
  } = useAuth();
  
  const location = useLocation();

  const handleLogout = () => {
    logout();
    // No need to navigate away after logout
  };

  // Modified to use modals instead of navigation for login/signup
  const handleLoginClick = () => {
    openLoginModal();
    setIsOpen(false); // Close mobile menu if open
  };

  const handleSignupClick = () => {
    openSignupModal();
    setIsOpen(false); // Close mobile menu if open
  };

  return (
    <nav className="bg-gradient-to-r from-blue-50 to-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              {/* Replace text logo with image logo */}
              <img
                src={hy}
                alt="HomeYatra Logo"
                style={{
                  height: "120px",
                  width: "200px",
                  objectFit: "cover",
                  filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))",
                  transition: "transform 0.3s ease",
                }}
                className="hover:transform hover:scale-105"
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              />
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              <Link
                to="/properties?type=buy"
                className="text-gray-800 hover:text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-all duration-200"
              >
                Buy
              </Link>
              <Link
                to="/properties?type=rent"
                className="text-gray-800 hover:text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-all duration-200"
              >
                Rent
              </Link>
              <Link
                to="/properties?type=plot"
                className="text-gray-800 hover:text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-all duration-200"
              >
                Plot
              </Link>
              <Link
                to="/properties?type=commercial"
                className="text-gray-800 hover:text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-all duration-200"
              >
               Commercial
              </Link>
              <Link
                to="/contactus"
                className="text-gray-800 hover:text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-all duration-200"
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => location.pathname !== "/post-property" && window.location.assign("/post-property")}
                  className="flex items-center gap-1 bg-blue-600 text-white hover:bg-white-700 rounded-full"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Post Property
                </Button>
                <NotificationIcon userId={user?.userId ?? ''} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 p-2 border border-blue-100"
                  >
                    <div className="px-2 py-2 font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" />
                        {user?.phone}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="hover:bg-blue-50">
                      <Link
                        to="/dashboard"
                        className="cursor-pointer flex items-center py-1"
                      >
                        <Home className="mr-2 h-4 w-4 text-blue-500" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer hover:bg-red-50 flex items-center py-1"
                    >
                      <LogOut className="mr-2 h-4 w-4 text-red-500" />
                      <span className="text-red-500">Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={handleLoginClick}
                  className="font-medium text-blue-600 hover:bg-blue-50"
                >
                  Login
                </Button>
                <Button
                  onClick={handleSignupClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-blue-600"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn("sm:hidden", isOpen ? "block" : "hidden")}>
        <div className="pt-2 pb-3 space-y-1 border-t bg-white">
          <Link
            to="/properties?type=buy"
            className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-500"
            onClick={() => setIsOpen(false)}
          >
            Buy
          </Link>
          <Link
            to="/properties?type=rent"
            className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-500"
            onClick={() => setIsOpen(false)}
          >
            Rent
          </Link>
          <Link
            to="/properties?type=plot"
            className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-500"
            onClick={() => setIsOpen(false)}
          >
           Plot
          </Link>
          <Link
            to="/properties?type=commercial"
            className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-500"
            onClick={() => setIsOpen(false)}
          >
          Commercial
          </Link>
          <Link
            to="/contactus"
            className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-500"
            onClick={() => setIsOpen(false)}
          >
            Contact
          </Link>
          {isAuthenticated ? (
            <>
              <div className="border-t border-gray-200"></div>
              <Link
                to="/post-property"
                className="block px-4 py-3 text-base font-medium text-blue-600 hover:bg-blue-50 border-l-4 border-transparent hover:border-blue-500"
                onClick={() => setIsOpen(false)}
              >
                <PlusCircle className="inline h-4 w-4 mr-2" />
                Post Property
              </Link>
              <Link
                to="/dashboard"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-500"
                onClick={() => setIsOpen(false)}
              >
                <Home className="inline h-4 w-4 mr-2" />
                Dashboard
              </Link>
          
              <div
                className="block px-4 py-3 text-base font-medium text-red-500 hover:bg-red-50 cursor-pointer border-l-4 border-transparent hover:border-red-500"
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
              >
                <LogOut className="inline h-4 w-4 mr-2" />
                Logout
              </div>
            </>
          ) : (
            <>
              <div className="border-t border-gray-200 pt-4 pb-3 px-4 flex flex-col space-y-3">
                <Button
                  variant="outline"
                  onClick={handleLoginClick}
                  className="w-full justify-center border-blue-500 text-blue-600"
                >
                  Login
                </Button>
                <Button
                  onClick={handleSignupClick}
                  className="w-full justify-center bg-blue-600 text-white"
                >
                  Sign Up
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}