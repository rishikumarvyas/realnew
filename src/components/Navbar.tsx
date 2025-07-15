import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import NotificationIcon from "@/components/NotificationIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, LogOut, PlusCircle, Home, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import hy from "../Images/hy1-removebg-preview.png";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout, openLoginModal, openSignupModal } =
    useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  // Parse query param "type" from URL
  const queryParams = new URLSearchParams(location.search);
  const currentType = queryParams.get("type") || "";

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleLoginClick = () => {
    openLoginModal();
    setIsOpen(false);
  };

  const handleSignupClick = () => {
    openSignupModal();
    setIsOpen(false);
  };

  const handlePostPropertyClick = () => {
    if (location.pathname !== "/post-property") {
      navigate("/post-property");
    }
    setIsOpen(false);
  };

  // Helper to check active link based on pathname & query param
  const isActive = (path, type = "") => {
    return (
      location.pathname === path &&
      (type ? queryParams.get("type") === type : true)
    );
  };

  return (
    <nav className="bg-gradient-to-r from-blue-50 to-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
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
              {[
                { label: "Buy", type: "buy" },
                { label: "Rent", type: "rent" },
                { label: "Plot", type: "plot" },
                { label: "Commercial", type: "commercial" },
              ].map(({ label, type }) => (
                <Link
                  key={type}
                  to={`/properties?type=${type}`}
                  className={cn(
                    "text-gray-800 px-3 py-2 text-sm font-medium border-b-2 transition-all duration-200",
                    isActive("/properties", type)
                      ? "text-blue-600 border-blue-600"
                      : "hover:text-blue-600 hover:border-blue-600 border-transparent"
                  )}
                >
                  {label}
                </Link>
              ))}
              <Link
                to="/contactus"
                className={cn(
                  "text-gray-800 hover:text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-all duration-200"
                )}
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <>
                {user?.role === "Admin" && (
                  <Button
                    variant="outline"
                    onClick={() => navigate("/admin")}
                    className="flex items-center gap-1 bg-blue-600 text-white hover:bg-white-700 rounded-full mr-2"
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    Admin
                  </Button>
                )}
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={handlePostPropertyClick}
                    className="flex items-center gap-1 bg-blue-600 text-white hover:bg-white-700 rounded-full"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Post Property
                  </Button>
                  <NotificationIcon />
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
                          {user?.name}
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
              </>
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
          {[
            { label: "Buy", type: "buy" },
            { label: "Rent", type: "rent" },
            { label: "Plot", type: "plot" },
            { label: "Commercial", type: "commercial" },
          ].map(({ label, type }) => (
            <Link
              key={type}
              to={`/properties?type=${type}`}
              className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-500"
              onClick={() => setIsOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            to="/contactus"
            className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-500"
            onClick={() => setIsOpen(false)}
          >
            Contact
          </Link>
          {isAuthenticated && (
            <>
              <Button
                variant="outline"
                onClick={handlePostPropertyClick}
                className="w-full justify-center flex items-center gap-1 bg-blue-600 text-white hover:bg-white-700 rounded-full my-2"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Post Property
              </Button>
              <Link
                to="/dashboard"
                className="w-full flex items-center gap-1 justify-center px-4 py-3 text-base font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 border-l-4 border-transparent hover:border-blue-500 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                <Home className="h-4 w-4 mr-1" />
                Dashboard
              </Link>
              {user?.role === "Admin" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate("/admin");
                    setIsOpen(false);
                  }}
                  className="w-full justify-center flex items-center gap-1 bg-blue-600 text-white hover:bg-white-700 rounded-full my-2"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Admin
                </Button>
              )}
              <div className="w-full flex justify-center my-2">
                <NotificationIcon />
              </div>
            </>
          )}
          {!isAuthenticated ? (
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
          ) : (
            <div className="border-t border-gray-200 pt-4 pb-3 px-4 flex flex-col space-y-3">
              <Button
                onClick={handleLogout}
                className="w-full justify-center bg-red-500 text-white"
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
