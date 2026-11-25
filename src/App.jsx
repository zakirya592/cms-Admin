import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AppShell } from "@/components/layout/AppShell";
import { isSectionSlug } from "@/landing/sections";
import { LandingSectionPage } from "@/pages/LandingSectionPage";
import { AdminAddSectionPage } from "@/pages/AdminAddSectionPage";
import { PagesPage } from "@/pages/PagesPage";
import { SectionsPage } from "@/pages/SectionsPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { useOffice } from "@/office";

function RequireAuth({ children }) {
  const { user } = useOffice();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function SectionRoute() {
  const { sectionKey = "" } = useParams();
  const key = sectionKey.trim().toLowerCase();
  if (!isSectionSlug(key)) return <Navigate to="/sections/add" replace />;
  return <LandingSectionPage sectionKey={key} />;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/pages" replace />} />
          <Route path="pages" element={<PagesPage />} />
          <Route path="sections" element={<SectionsPage />} />
          <Route path="sections/add" element={<AdminAddSectionPage />} />
          <Route path="header/edit" element={<LandingSectionPage sectionKey="header" mode="edit" />} />
          <Route path="projects/edit" element={<LandingSectionPage sectionKey="projects" mode="edit" />} />
          <Route path=":sectionKey" element={<SectionRoute />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={2800} closeOnClick pauseOnHover theme="light" />
    </>
  );
}
