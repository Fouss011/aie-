import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ChatBox from "../ChatBox";

export default function AppShell({
  children,
  activePage,
  onNavigate,
  menuItems,
  universe,
  onSwitchUniverse,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleNavigate(page) {
    onNavigate(page);
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#EAF0F7] text-slate-950 antialiased">
      <div className="relative min-h-screen w-full overflow-x-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_25%),radial-gradient(circle_at_top_right,rgba(2,132,199,0.10),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_28%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(226,232,240,0.30))]" />
          <div className="absolute -right-28 top-[-110px] h-[360px] w-[360px] rounded-full bg-blue-300/30 blur-3xl" />
          <div className="absolute -left-24 bottom-[-120px] h-[330px] w-[330px] rounded-full bg-slate-400/25 blur-3xl" />
        </div>

        <div className="relative mx-auto flex min-h-screen w-full max-w-[1580px] gap-4 px-3 py-3 sm:gap-5 sm:px-5 sm:py-4 lg:px-8">
          <Sidebar
  activePage={activePage}
  onNavigate={handleNavigate}
  menuItems={menuItems}
  mobileOpen={mobileMenuOpen}
  onClose={() => setMobileMenuOpen(false)}
  universe={universe}
  onSwitchUniverse={onSwitchUniverse}
/>

          <div className="min-w-0 flex-1 overflow-x-hidden">
            <Topbar
              activePage={activePage}
              onOpenMenu={() => setMobileMenuOpen(true)}
            />

            <main className="mt-3 w-full min-w-0 overflow-x-hidden pb-28 sm:mt-4 sm:pb-24">
              {children}
            </main>
          </div>
        </div>
      </div>

      {!mobileMenuOpen ? <ChatBox universe={universe} /> : null}
    </div>
  );
}
