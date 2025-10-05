import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import InactivityModal from "./InactivityModal";

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <InactivityModal />
      <Footer />
    </div>
  );
}
