import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import { BadgeCheck, Globe, HardHat, Image, Info, Layers, ListOrdered, LogOut, Megaphone, PanelBottom, PanelTop, Phone, Plus, Quote, Wrench } from "lucide-react";
import { previewRows } from "@/components/layout/AllPreview";
import { useLandingSections } from "@/landing/queries";
import { findSection, landingSections } from "@/landing/sections";
import { useOffice } from "@/office";
const icons = {
  header: PanelTop,
  hero: Image,
  about: Info,
  services: Wrench,
  projects: HardHat,
  "why-us": BadgeCheck,
  process: ListOrdered,
  testimonials: Quote,
  cta: Megaphone,
  contact: Phone,
  footer: PanelBottom,
};

function navItem(row) {
  const section = findSection(row.sectionKey);
  return {
    to: section?.path || `/${row.sectionKey}`,
    label: row.sectionName || section?.name || row.sectionKey,
    icon: icons[row.sectionKey] || Layers,
  };
}

function sectionNav(saved) {
  const rows = Array.isArray(saved) ? saved : [];
  const ordered = previewRows(rows);
  const orderedKeys = new Set(ordered.map((row) => row.sectionKey));
  const listed = ordered.map(navItem);
  const rest = landingSections
    .filter((section) => rows.some((row) => row.sectionKey === section.key) && !orderedKeys.has(section.key))
    .map((section) => {
      const row = rows.find((item) => item.sectionKey === section.key);
      return navItem({ ...row, sectionKey: section.key, sectionName: row?.sectionName });
    });
  const footer = listed.filter((item) => item.to === "/footer");
  const main = listed.filter((item) => item.to !== "/footer");
  return [...main, ...rest, ...footer];
}

function initials(name) {
  const parts = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "NL";
  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join("");
}

export function AppShell() {
  const { user, logout } = useOffice();
  const saved = useLandingSections();
  const nav = sectionNav(saved.data);
  const navigate = useNavigate();
  const { pathname } = useLocation();
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
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-stone-900 to-stone-800 text-[14px] font-semibold text-amber-200 border border-amber-300/30 shadow-sm">
              CMS
            </div>
            <div className="min-w-0">
              <p className="font-serif text-[1.3rem] leading-none tracking-tight text-ink">
                CMS Studio
              </p>
              <p className="mt-1 text-[11px] tracking-wide text-stone-500">
                {today}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium cursor-pointer ${
                pathname === "/pages"
                  ? "bg-stone-900 text-white border-stone-900 hover:bg-stone-800"
                  : "glass-btn-outline"
              }`}
              onPress={() => navigate("/pages")}
            >
              <Globe size={14} /> Pages
            </Button>
            <Button
              variant="outline"
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium cursor-pointer ${
                pathname === "/sections" || pathname.startsWith("/sections/")
                  ? "bg-stone-900 text-white border-stone-900 hover:bg-stone-800"
                  : "glass-btn-outline"
              }`}
              onPress={() => navigate("/sections")}
            >
              <Layers size={14} /> Sections
            </Button>
            {/* <Button
              variant="primary"
              className="glass-btn-primary rounded-full px-4 py-1.5 text-xs font-medium cursor-pointer"
              onPress={() => navigate("/sections/add")}
            >
              <Plus size={14} /> Add Section
            </Button> */}
            <Button
              variant="outline"
              className="glass-btn-outline rounded-full px-4 py-1.5 text-xs font-medium cursor-pointer"
              onPress={() => window.open("https://cmslanding-six.vercel.app/", "_blank", "noopener,noreferrer")}
            >
              <Globe size={14} /> View site
            </Button>
            <span
              className="hidden h-6 w-px bg-stone-300/60 sm:block"
              aria-hidden="true"
            />
            <div className="glass-pill flex min-w-0 items-center gap-2.5 rounded-full py-1 pr-3.5 pl-1">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-linear-to-br from-amber-100 to-amber-200 border border-amber-300/40 text-[11px] font-semibold text-amber-900">
                {initials(user?.name)}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block truncate text-xs leading-tight font-medium text-stone-800">
                  {user?.name}
                </span>
                <span className="block truncate text-[10px] leading-tight text-stone-500">
                  {user?.email}
                </span>
              </span>
            </div>
            <Button
              variant="ghost"
              className="rounded-full text-xs text-stone-600 hover:text-stone-950 hover:bg-white/60 transition-colors"
              onPress={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut size={14} /> Sign out
            </Button>
          </div>
        </div>

        {/* Glass Tab Navigation Dock */}
        {/* <div className="border-t border-white/40 px-3 py-1.5 md:px-7">
          <nav
            aria-label="Sections"
            className="section-tabs flex items-center gap-1.5 overflow-x-auto py-0.5"
          >
            <NavLink
              to="/pages"
              className={`glass-nav-tab flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${
                pathname === "/pages"
                  ? "glass-nav-tab-active"
                  : "glass-nav-tab-inactive"
              }`}
            >
              <Globe size={14} />
              Pages
            </NavLink>
            <NavLink
              to="/sections"
              className={`glass-nav-tab flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${
                pathname === "/sections"
                  ? "glass-nav-tab-active"
                  : "glass-nav-tab-inactive"
              }`}
            >
              <Layers size={14} />
              Sections
            </NavLink>
            <span
              className="h-4 w-px bg-stone-300/40 mx-1 shrink-0"
              aria-hidden="true"
            />
            {nav.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`glass-nav-tab flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${
                    active ? "glass-nav-tab-active" : "glass-nav-tab-inactive"
                  }`}
                >
                  <Icon size={14} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div> */}
      </header>

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
