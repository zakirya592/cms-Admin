import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button, Modal } from "@heroui/react";
import { motion } from "framer-motion";
import { Globe, Layers, LogOut, Moon, Sun } from "lucide-react";
import { getTheme, toggleTheme } from "@/theme";
import { useOffice } from "@/office";

function initials(name) {
  const parts = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "NL";
  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join("");
}

export function AppShell() {
  const { user, logout } = useOffice();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [theme, setTheme] = useState(getTheme);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const isDark = theme === "dark";
  const segBase = isDark
    ? "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200"
    : "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200";
  const segActive = isDark
    ? "bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_8px_rgba(0,0,0,0.3)]"
    : "bg-stone-900 text-white shadow-[0_2px_8px_rgba(28,25,20,0.25)]";
  const segInactive = isDark
    ? "text-stone-400 hover:text-white"
    : "text-stone-500 hover:text-stone-900";

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(getTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="relative min-h-screen text-ink overflow-x-hidden">
      {/* Dynamic Ambient Background Glows for Glass Refraction */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
        aria-hidden="true"
      >
        <div className="animate-ambient-float-1 absolute -top-24 -left-24 h-120 w-120 rounded-full bg-linear-to-br from-amber-300/25 to-amber-500/15 blur-[110px]" />
        <div className="animate-ambient-float-2 absolute top-[25%] -right-20 h-130 w-130 rounded-full bg-linear-to-bl from-orange-300/20 to-rose-300/15 blur-[120px]" />
        <div className="animate-ambient-float-3 absolute bottom-[-10%] left-[20%] h-137 w-137 rounded-full bg-linear-to-tr from-sky-300/20 to-teal-200/15 blur-[130px]" />
        <div className="absolute top-[65%] right-[25%] h-95 w-95 rounded-full bg-linear-to-r from-amber-200/20 to-yellow-100/25 blur-[100px]" />
      </div>

      {/* Frosted Glass Header */}
      <header className="glass-header sticky top-0 z-30">
        <div className="mx-auto flex max-w-350 flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 md:px-8">
          {/* Brand */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-stone-900 to-stone-800 text-[13px] font-bold tracking-wide text-amber-200 border border-amber-300/30 shadow-md">
              CMS
            </div>
            <div className="min-w-0">
              <p className="font-serif text-[1.35rem] leading-none tracking-tight text-ink">
                CMS Studio
              </p>
              <p className="mt-1 text-[11px] font-medium tracking-wide text-stone-500">
                {today}
              </p>
            </div>
          </div>

          {/* Center: segmented navigation */}
          <nav
            aria-label="Primary"
            className={`order-3 flex w-full items-center justify-center gap-1 rounded-full p-1 sm:order-0 sm:w-auto ${
              isDark ? "bg-white/5 border border-white/10" : "glass-pill"
            }`}
          >
            <button
              type="button"
              onClick={() => navigate("/pages")}
              className={`cursor-pointer ${segBase} ${pathname === "/pages" || pathname.startsWith("/pages/") ? segActive : segInactive}`}
            >
              <Globe size={14} /> Pages
            </button>
            <button
              type="button"
              onClick={() => navigate("/sections")}
              className={`cursor-pointer ${segBase} ${pathname === "/sections" || pathname.startsWith("/sections/") ? segActive : segInactive}`}
            >
              <Layers size={14} /> Sections
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Button
              variant="outline"
              className={`${isDark ? "border-white/15 bg-white/5 text-stone-200 hover:bg-white/10 hover:text-white" : "glass-btn-outline"} rounded-full px-3.5 py-1.5 text-xs font-medium cursor-pointer`}
              onPress={() => window.open("https://cmslanding-six.vercel.app/", "_blank", "noopener,noreferrer")}
            >
              <Globe size={14} />
              <span className="hidden sm:inline">View site</span>
            </Button>

            <Button
              isIconOnly
              variant="outline"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
              className={`${isDark ? "border-white/15 bg-white/5 text-amber-200 hover:bg-white/10" : "glass-btn-outline"} rounded-full h-8 w-8 min-w-8 cursor-pointer`}
              onPress={() => setTheme(toggleTheme())}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </Button>

            <span className="hidden h-6 w-px bg-stone-300/60 sm:block" aria-hidden="true" />

            {/* User pill */}
            <div className={`glass-pill flex min-w-0 items-center gap-2.5 rounded-full py-1 pr-3 pl-1 ${isDark ? "bg-white/5! border-white/10!" : ""}`}>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-linear-to-br from-amber-100 to-amber-200 border border-amber-300/40 text-[11px] font-semibold text-amber-900">
                {initials(user?.name)}
              </span>
              <span className="hidden min-w-0 md:block">
                <span className="block max-w-28 truncate text-xs leading-tight font-medium text-stone-800">
                  {user?.name}
                </span>
                <span className="block max-w-28 truncate text-[10px] leading-tight text-stone-500">
                  {user?.email}
                </span>
              </span>
            </div>

            <Button
              isIconOnly
              variant="ghost"
              aria-label="Sign out"
              title="Sign out"
              className={`group rounded-full h-8 w-8 min-w-8 cursor-pointer ${isDark ? "text-stone-400 hover:text-rose-300 hover:bg-rose-400/10" : "text-stone-600 hover:text-rose-600 hover:bg-rose-50/70"}`}
              onPress={() => setLogoutOpen(true)}
            >
              <LogOut size={15} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Logout confirmation modal */}
      <Modal isOpen={logoutOpen} onOpenChange={setLogoutOpen}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="glass-modal relative max-w-sm overflow-hidden p-0">
              <div className={`h-1.5 w-full ${isDark ? "bg-linear-to-r from-rose-500/70 via-amber-400/60 to-rose-500/70" : "bg-linear-to-r from-rose-400 via-amber-300 to-rose-400"}`} />
              <div className="p-6 sm:p-7">
                <div className="flex flex-col items-center text-center">
                  <span className={`grid h-14 w-14 place-items-center rounded-2xl border shadow-lg ${isDark ? "border-rose-300/20 bg-rose-400/10 text-rose-300" : "border-rose-200/70 bg-rose-50 text-rose-600"}`}>
                    <LogOut size={22} className="animate-logout-icon" />
                  </span>
                  <Modal.Heading className="font-serif mt-4 text-2xl text-ink">
                    Sign out?
                  </Modal.Heading>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    You&apos;ll need to sign in again to keep managing{" "}
                    <span className="font-medium text-ink">{user?.name ? `${user.name.split(" ")[0]}'s ` : ""}CMS Studio</span>.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-center gap-2.5">
                  <Button
                    slot="close"
                    variant="ghost"
                    className={`rounded-full px-5 py-2 text-xs font-medium cursor-pointer ${isDark ? "text-stone-300 hover:bg-white/10 hover:text-white" : "text-stone-600 hover:bg-white/70 hover:text-stone-900"}`}
                  >
                    Stay signed in
                  </Button>
                  <Button
                    variant="primary"
                    className="rounded-full px-5 py-2 text-xs font-semibold cursor-pointer bg-linear-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/25 hover:from-rose-600 hover:to-rose-700"
                    onPress={() => {
                      setLogoutOpen(false);
                      logout();
                      navigate("/login");
                    }}
                  >
                    <LogOut size={14} /> Sign out
                  </Button>
                </div>
              </div>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* Main Content Area */}
      <main className="relative px-4 py-6 md:px-8 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
