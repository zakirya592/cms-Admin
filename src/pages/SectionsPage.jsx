import { useState } from "react";
import { Button, Chip } from "@heroui/react";
import {
  Copy,
  Layers,
  Loader2,
  Plus,
} from "lucide-react";
import { toast } from "react-toastify";
import { DataTable } from "@/components/DataTable";
import { ConfirmDialog } from "@/components/Fields";
import { PageHeader } from "@/components/PageBits";
import { SectionFormDialog, SECTION_ICONS } from "@/components/sections/SectionFormDialog";
import { useAdminSections, useAdminSectionAction } from "@/landing/sectionQueries";
import { useNavigate } from "react-router-dom";

// ── Status chip colours ────────────────────────────────────────────────────
const statusTones = {
  active: "bg-emerald-100/70 text-emerald-950 border-emerald-300/60",
  inactive: "bg-stone-200/70 text-stone-800 border-stone-300/60",
};

// ── Helpers ────────────────────────────────────────────────────────────────
function labelFromType(type) {
  if (!type) return "—";
  return type.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function shownDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
}

// ── Page ───────────────────────────────────────────────────────────────────
export function SectionsPage() {
  const navigate = useNavigate();
  const sectionsQuery = useAdminSections();
  const sectionAction = useAdminSectionAction();

  const [editorOpen, setEditorOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [pendingActionId, setPendingActionId] = useState(null);
  const [pendingActionType, setPendingActionType] = useState(null);

  const sections = Array.isArray(sectionsQuery.data) ? sectionsQuery.data : [];

  function onAdd() {
    navigate('/sections/add')
  }

  function onEdit(sec) {
    const key = sec.sectionKey || sec.type || sec.name;
    if (key) navigate(`/${String(key).toLowerCase()}`);
  }

  function onDeletePrompt(sec) {
    setSectionToDelete(sec);
    setDeleteOpen(true);
  }

  async function onConfirmDelete() {
    if (!sectionToDelete) return;
    const id = sectionToDelete._id || sectionToDelete.id;
    try {
      await sectionAction.mutateAsync({ id, action: "delete" });
      toast.success(`"${sectionToDelete.name}" deleted`);
      setDeleteOpen(false);
      setSectionToDelete(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to delete section");
    }
  }

  async function onToggleStatus(sec) {
    const id = sec._id || sec.id;
    const isActive = sec.status === "active";
    const newStatus = isActive ? "inactive" : "active";
    setPendingActionId(id);
    setPendingActionType("status");
    try {
      await sectionAction.mutateAsync({ id, action: "status", status: newStatus });
      toast.success(`${sec.name} set to ${newStatus}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update status");
    } finally {
      setPendingActionId(null);
      setPendingActionType(null);
    }
  }

  async function onDuplicate(sec) {
    const id = sec._id || sec.id;
    setPendingActionId(id);
    setPendingActionType("duplicate");
    try {
      await sectionAction.mutateAsync({ id, action: "duplicate" });
      toast.success(`"${sec.name}" duplicated`);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to duplicate section");
    } finally {
      setPendingActionId(null);
      setPendingActionType(null);
    }
  }

  // ── Table columns ────────────────────────────────────────────────────────
  const columns = [
    {
      header: "Section",
      rowHeader: true,
      cell: (row) => {
        const SecIcon = SECTION_ICONS[row.type] || Layers;
        return (
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-300/40 text-amber-800 shadow-xs">
              <SecIcon size={15} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-ink leading-tight truncate">
                {row.name || "Untitled"}
              </p>
              <p className="text-[10px] text-stone-400 font-medium mt-0.5">
                ID: {(row._id || row.id || "").slice(-8)}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Type",
      cell: (row) => (
        <span className="inline-flex items-center gap-1.5 capitalize text-xs font-medium text-stone-700 glass-pill px-2.5 py-0.5 rounded-full border border-white/60">
          {labelFromType(row.type)}
        </span>
      ),
    },
    {
      header: "Order",
      cell: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-100/60 text-amber-900 border border-amber-200/70">
          #{row.order ?? "—"}
        </span>
      ),
    },
    {
      header: "Content Preview",
      cell: (row) => {
        const c = row.content;
        if (!c) return <span className="text-xs text-stone-400">—</span>;
        const preview = c.title || c.subtitle || c.description || "";
        const trimmed = String(preview).replace(/<[^>]*>/g, " ").trim().slice(0, 60);
        if (!trimmed) return <span className="text-xs text-stone-400">—</span>;
        return (
          <span className="text-xs text-stone-600 italic line-clamp-1" title={trimmed}>
            &ldquo;{trimmed}{preview.length > 60 ? "…" : ""}&rdquo;
          </span>
        );
      },
    },
    {
      header: "Status",
      cell: (row) => {
        const st = String(row.status || "inactive").toLowerCase();
        return (
          <Chip
            size="sm"
            className={`capitalize glass-pill border backdrop-blur-md px-2.5 py-0.5 text-xs font-medium ${statusTones[st] ?? "bg-stone-200/60 text-stone-700"}`}
          >
            {st === "active" && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            )}
            {st}
          </Chip>
        );
      },
    },
    {
      header: "Updated",
      cell: (row) => (
        <span className="text-xs text-stone-500 whitespace-nowrap">
          {shownDate(row.updatedAt || row.createdAt)}
        </span>
      ),
    },
    {
      header: "Quick Actions",
      cell: (row) => {
        const id = row._id || row.id;
        const isActive = row.status === "active";
        const isPendingThis = pendingActionId === id;

        return (
          <div className="flex items-center gap-1.5">
            {/* Toggle Active/Inactive */}
            <button
              type="button"
              disabled={isPendingThis}
              onClick={() => onToggleStatus(row)}
              title={isActive ? "Set inactive" : "Set active"}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer shadow-xs disabled:opacity-50 select-none group ${
                isActive
                  ? "glass-pill border-emerald-300/50 bg-emerald-50/60 text-emerald-950 hover:bg-rose-50/70 hover:text-rose-800 hover:border-rose-300/60"
                  : "glass-pill border-stone-300/50 bg-stone-50/60 text-stone-700 hover:bg-emerald-50/70 hover:text-emerald-900 hover:border-emerald-300/60"
              }`}
            >
              {isPendingThis && pendingActionType === "status" ? (
                <Loader2 size={12} className="animate-spin" />
              ) : isActive ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600 group-hover:bg-rose-500 transition-colors" />
                  </span>
                  <span className="group-hover:hidden">Active</span>
                  <span className="hidden group-hover:inline">Deactivate</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-stone-400 group-hover:bg-emerald-500 transition-colors" />
                  <span className="group-hover:hidden">Inactive</span>
                  <span className="hidden group-hover:inline">Activate</span>
                </>
              )}
            </button>

            {/* Duplicate */}
            <button
              type="button"
              disabled={isPendingThis}
              onClick={() => onDuplicate(row)}
              title="Duplicate section"
              className="grid h-7 w-7 place-items-center rounded-lg glass-pill text-stone-500 hover:text-amber-900 hover:bg-amber-100/60 transition-all cursor-pointer disabled:opacity-50"
            >
              {isPendingThis && pendingActionType === "duplicate" ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        kicker="Management"
        title="Sections"
        description="Create and manage reusable content sections — control type, order, status, and assign them to pages."
        action={
          <Button
            variant="primary"
            className="glass-btn-primary rounded-full px-4.5 py-2 text-xs font-medium cursor-pointer"
            onPress={onAdd}
          >
            <Plus size={15} /> Add Section
          </Button>
        }
      />

      {sectionsQuery.isLoading && (
        <div className="glass-panel rounded-2xl p-8 text-center text-sm text-stone-500">
          Loading sections…
        </div>
      )}

      {sectionsQuery.isError && (
        <div className="glass-panel rounded-2xl p-6 text-center text-sm text-rose-600 border border-rose-200/60 mb-6">
          {sectionsQuery.error?.message || "Could not load sections"}
        </div>
      )}

      {!sectionsQuery.isLoading && (
        <DataTable
          label="Sections"
          rows={sections}
          columns={columns}
          empty="No sections yet. Click 'Add Section' to create your first one."
          onEdit={onEdit}
          onDelete={onDeletePrompt}
        />
      )}

      {/* Add / Edit Dialog */}
      <SectionFormDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        section={activeSection}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        title={`Delete "${sectionToDelete?.name || "section"}"?`}
        body="This will permanently remove the section. Pages that use it will lose this reference."
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={onConfirmDelete}
        pending={sectionAction.isPending}
      />
    </div>
  );
}
