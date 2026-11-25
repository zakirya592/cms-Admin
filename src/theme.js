const THEME_KEY = "cms-admin-theme";

export function getTheme() {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function initTheme() {
  if (typeof document === "undefined") return;
  let theme = "light";
  try {
    theme = localStorage.getItem(THEME_KEY) || "light";
  } catch {
    theme = "light";
  }
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function toggleTheme() {
  const next = getTheme() === "dark" ? "light" : "dark";
  document.documentElement.classList.toggle("dark", next === "dark");
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // storage unavailable
  }
  return next;
}
