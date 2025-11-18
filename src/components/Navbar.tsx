import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import NotificationIcon from "@/components/NotificationIcon";
import AddBuilderModal from "@/components/AddBuilderModal";
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
  Shield,
  Building,
  KeyRound,
  LandPlot,
  Store,
  Hammer,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import hy from "../Images/hy1-removebg-preview.png";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddBuilderModal, setShowAddBuilderModal] = useState(false);
  const { user, isAuthenticated, logout, openLoginModal, openSignupModal } =
    useAuth();
  const { toast } = useToast();

  const location = useLocation();
  const navigate = useNavigate();

  // Parse query param "type" from URL
  const queryParams = new URLSearchParams(location.search);
  const currentType = queryParams.get("type") || "";

  const handleLogout = () => {
    // Perform logout, clear caches, notify user and navigate home
    logout();
    try {
      // Clear local and session storage to remove cached data
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      // ignore storage errors
    }

    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });

    navigate("/");
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

  const handleAddBuilderClick = () => {
    setShowAddBuilderModal(true);
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
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
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
                to="/get-project-api"
                className={cn(
                  "text-gray-800 hover:text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-all duration-200"
                )}
              >
                New Launching
              </Link>
              
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <>
                {user?.role === "Admin" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/admin")}
                      className="flex items-center gap-1 bg-blue-600 text-white hover:bg-white-700 rounded-full mr-2"
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Admin
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700 rounded-full mr-2"
                        >
                          <Hammer className="h-4 w-4 mr-1" />
                          Builder
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 p-2 border border-blue-100"
                      >
                        <DropdownMenuItem
                          onClick={handleAddBuilderClick}
                          className="cursor-pointer hover:bg-blue-50 flex items-center py-2"
                        >
                          <PlusCircle className="mr-2 h-4 w-4 text-blue-500" />
                          <span className="text-blue-600">Add Builder</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate("/add-project")}
                          className="cursor-pointer hover:bg-blue-50 flex items-center py-2"
                        >
                          <PlusCircle className="mr-2 h-4 w-4 text-blue-500" />
                          <span className="text-blue-600">Add Project</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate("/get-project")}
                          className="cursor-pointer hover:bg-blue-50 flex items-center py-2"
                        >
                          <Building className="mr-2 h-4 w-4 text-blue-500" />
                          <span className="text-blue-600">My Project</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
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
                  {/* Post Project button for builder role only (admin has it in Builder dropdown) */}
                  {user?.role === "Builder" && (
                    <></>
                  )}
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
                      <div className="px-2 py-2">
                        <button
                          onClick={() => {
                            navigate("/profile");
                            setIsOpen(false);
                          }}
                          className="w-full text-left flex items-center gap-2 font-medium text-gray-700 hover:bg-blue-50 p-2 rounded"
                        >
                          <User className="h-4 w-4 text-blue-500" />
                          <span>{user?.name}</span>
                        </button>
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
                  onClick={handleLoginClick}
                  className="bg-blue-500 rounded-full hover:bg-blue-700 text-white"
                >
                  Login
                </Button>
                <Button
                  onClick={handleSignupClick}
                  className="bg-blue-500 rounded-full hover:bg-blue-700 text-white"
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
        <div className="space-y-2 border-t bg-gray-50 px-3 py-4">
          {/* Main Navigation */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Buy",
                type: "buy",
                icon: <Building className="h-6 w-6" />,
                color: "text-blue-600",
                bgColor: "bg-blue-100 hover:bg-blue-200",
              },
              {
                label: "Rent",
                type: "rent",
                icon: <KeyRound className="h-6 w-6" />,
                color: "text-orange-600",
                bgColor: "bg-orange-100 hover:bg-orange-200",
              },
              {
                label: "Plot",
                type: "plot",
                icon: <LandPlot className="h-6 w-6" />,
                color: "text-green-600",
                bgColor: "bg-green-100 hover:bg-green-200",
              },
              {
                label: "Commercial",
                type: "commercial",
                icon: <Store className="h-6 w-6" />,
                color: "text-purple-600",
                bgColor: "bg-purple-100 hover:bg-purple-200",
              },
            ].map(({ label, type, icon, color, bgColor }) => (
              <Link
                key={type}
                to={`/properties?type=${type}`}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-xl transition-colors",
                  bgColor
                )}
                onClick={() => setIsOpen(false)}
              >
                <div className={cn("mb-1", color)}>{icon}</div>
                <span className={cn("text-sm font-semibold", color)}>
                  {label}
                </span>
              </Link>
            ))}
            {/* Post Property as a card */}
          </div>

          {/* User Actions */}
          <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
            {isAuthenticated ? (
              <>
                {/* Primary Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Link
                    to="/post-property"
                    onClick={() => {
                      handlePostPropertyClick();
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center p-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full transition-all shadow-md min-h-[40px]"
                  >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    <span>Post Property</span>
                  </Link>
                  {/* Post Project button for builder and admin roles */}
                  {(user?.role === "Builder" || user?.role === "Admin") && (
                    <></>
                  )}
                </div>

                {/* Secondary Actions */}
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center p-3 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <Home className="w-5 h-5 mr-3 text-gray-500" /> Dashboard
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center p-3 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <User className="w-5 h-5 mr-3 text-gray-500" /> Profile
                </Link>
                {user?.role === "Admin" && (
                  <>
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center p-3 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      <Shield className="w-5 h-5 mr-3 text-gray-500" /> Admin
                      Panel
                    </Link>
                    {/* Builder dropdown for mobile */}
                    <div className="border-l-4 border-blue-500 pl-3 ml-3">
                      <div className="text-sm font-semibold text-blue-600 mb-2 flex items-center">
                        <Hammer className="w-4 h-4 mr-2" />
                        Builder Actions
                      </div>
                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            handleAddBuilderClick();
                            setIsOpen(false);
                          }}
                          className="flex items-center p-2 text-sm font-medium text-gray-700 hover:bg-blue-50 rounded-md w-full text-left"
                        >
                          <PlusCircle className="w-4 h-4 mr-2 text-blue-500" />
                          Add Builder
                        </button>
                        <Link
                          to="/add-project"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center p-2 text-sm font-medium text-gray-700 hover:bg-blue-50 rounded-md"
                        >
                          <PlusCircle className="w-4 h-4 mr-2 text-blue-500" />
                          Add Project
                        </Link>
                        <Link
                          to="/get-project"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center p-2 text-sm font-medium text-gray-700 hover:bg-blue-50 rounded-md"
                        >
                          <Building className="w-4 h-4 mr-2 text-blue-500" />
                          My Project
                        </Link>
                      </div>
                    </div>
                  </>
                )}
                <Link
                  to="/get-project-api"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center p-3 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <Building className="w-5 h-5 mr-3 text-gray-500" /> New Launching
                </Link>
                

                <div className="flex justify-center py-2 relative">
                  <div className="relative">
                    <NotificationIcon />
                  </div>
                </div>

                {/* Logout */}
                <div className="pt-2">
                  <Button
                    onClick={handleLogout}
                    className="w-full justify-center bg-gradient-to-r from-red-500 to-orange-400 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    <LogOut className="w-5 h-5 mr-2" /> Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="pt-2 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleLoginClick}
                  className="w-full justify-center border-blue-500 text-blue-600 font-bold py-3 rounded-lg"
                >
                  Login
                </Button>
                <Button
                  onClick={handleSignupClick}
                  className="w-full justify-center bg-blue-600 text-white font-bold py-3 rounded-lg"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Builder Modal */}
      <AddBuilderModal
        isOpen={showAddBuilderModal}
        onClose={() => setShowAddBuilderModal(false)}
      />
    </nav>
  );
}
