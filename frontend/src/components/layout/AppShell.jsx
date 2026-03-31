import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ChatBox from "../ChatBox";

export default function AppShell({
  children,
  activePage,
  onNavigate,
  menuItems,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleNavigate(page) {
    onNavigate(page);
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#E7EDF5] text-slate-900">
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.10),transparent_24%),radial-gradient(circle_at_top_right,rgba(15,23,42,0.08),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.22),rgba(15,23,42,0.05))]" />
        <div className="absolute top-[-70px] right-[-50px] h-[260px] w-[260px] rounded-full bg-blue-200/35 blur-3xl" />
        <div className="absolute bottom-[-110px] left-[-60px] h-[280px] w-[280px] rounded-full bg-slate-300/45 blur-3xl" />

        <div className="relative mx-auto flex min-h-screen max-w-[1600px] gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-4 lg:px-8">
          <Sidebar
            activePage={activePage}
            onNavigate={handleNavigate}
            menuItems={menuItems}
            mobileOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />

          <div className="min-w-0 flex-1">
            <Topbar
              activePage={activePage}
              onOpenMenu={() => setMobileMenuOpen(true)}
            />
            <main className="mt-3 sm:mt-4">{children}</main>
          </div>
        </div>
      </div>

      <ChatBox />
    </div>
  );
}