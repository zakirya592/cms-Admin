import { useState } from "react";
import { Button, Chip } from "@heroui/react";
import { ExternalLink, EyeOff, Globe, Layers, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/DataTable";
import { ConfirmDialog } from "@/components/Fields";
import { PageHeader } from "@/components/PageBits";
import { useAdminPages, usePageAction } from "@/landing/pageQueries";

const statusTones = {
  published: "bg-emerald-100/70 text-emerald-950 border-emerald-300/60",
  draft: "bg-amber-100/70 text-amber-950 border-amber-300/60",
  archived: "bg-stone-200/70 text-stone-800 border-stone-300/60",
};

export function PagesPage() {
  const navigate = useNavigate();
  const pagesQuery = useAdminPages();
  const pageAction = usePageAction();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [pendingActionId, setPendingActionId] = useState(null);

  const pages = Array.isArray(pagesQuery.data) ? pagesQuery.data : [];

  function onAdd() {
    navigate("/pages/new");
  }

  function onEdit(page) {
    const id = page._id || page.id;
    if (id) navigate(`/pages/${id}/edit`);
  }

  function onDeletePrompt(page) {
    setPageToDelete(page);
    setDeleteOpen(true);
  }

  async function onConfirmDelete() {
    if (!pageToDelete) return;
    const id = pageToDelete._id || pageToDelete.id;
    try {
      await pageAction.mutateAsync({ id, action: "delete" });
      toast.success("Page deleted");
      setDeleteOpen(false);
      setPageToDelete(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to delete page");
    }
  }

  async function onTogglePublish(page) {
    const id = page._id || page.id;
    const isPublished = page.status === "published";
    const action = isPublished ? "unpublish" : "publish";
    setPendingActionId(id);
    try {
      await pageAction.mutateAsync({ id, action });
      toast.success(isPublished ? "Page unpublished" : "Page published live");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || `Failed to ${action} page`);
    } finally {
      setPendingActionId(null);
    }
  }

  const columns = [
    {
      header: "Title",
      rowHeader: true,
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-400/15 text-amber-800 border border-amber-400/30">
            <Globe size={14} />
          </div>
          <div>
            <p className="font-medium text-ink">{row.title || "Untitled"}</p>
            <p className="text-xs text-stone-400">/{row.slug || ""}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      cell: (row) => (
        <span className="capitalize text-xs font-medium text-stone-600 glass-pill px-2.5 py-0.5 rounded-full">
          {row.pageType || "custom"}
        </span>
      ),
    },
    {
      header: "Sections",
      cell: (row) => {
        const sectionsList = Array.isArray(row.sections) ? row.sections : [];
        if (!sectionsList.length) {
          return <span className="text-xs text-stone-400">None</span>;
        }
        return (
          <div className="flex flex-wrap items-center gap-1 max-w-xs">
            {sectionsList.slice(0, 3).map((s, idx) => {
              const name = s.section?.name || s.section?.type || `Sec ${idx + 1}`;
              return (
                <span
                  key={s.section?._id || idx}
                  className="glass-pill px-2 py-0.5 text-[10px] font-medium text-stone-700 rounded-md"
                >
                  {name}
                </span>
              );
            })}
            {sectionsList.length > 3 && (
              <span className="text-[10px] text-stone-400 font-medium">
                +{sectionsList.length - 3} more
              </span>
            )}
          </div>
        );
      },
    },
    // {
    //   header: "Updated",
    //   cell: (row) => {
    //     const dateStr = row.updatedAt || row.publishedAt || row.createdAt;
    //     if (!dateStr) return "—";
    //     const d = new Date(dateStr);
    //     return (
    //       <span className="text-xs text-stone-500 whitespace-nowrap">
    //         {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d)}
    //       </span>
    //     );
    //   },
    // },
    {
      header: "Status",
      cell: (row) => {
        const st = String(row.status || "draft").toLowerCase();
        return (
          <Chip size="sm" className={`capitalize glass-pill border backdrop-blur-md px-2.5 py-0.5 text-xs font-medium ${statusTones[st] ?? "bg-stone-200/60 text-stone-700"}`}>
            {st}
          </Chip>
        );
      },
    },
    {
      header: "Quick Action",
      cell: (row) => {
        const id = row._id || row.id;
        const isPublished = row.status === "published";
        const isPending = pendingActionId === id;

        return (
          <div className="flex items-center gap-2 ">
            <button
              type="button"
              disabled={isPending}
              onClick={() => onTogglePublish(row)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer shadow-xs disabled:opacity-50 select-none ${
                isPublished
                  ? "glass-pill border-emerald-300/50 bg-emerald-50/60 text-emerald-950 hover:bg-rose-50/70 hover:text-rose-800 hover:border-rose-300/60 group"
                  : "glass-pill border-amber-300/50 bg-amber-50/60 text-amber-950 hover:bg-emerald-50/70 hover:text-emerald-900 hover:border-emerald-300/60 group"
              }`}
            >
              {isPending ? (
                <Loader2 size={13} className="animate-spin text-stone-500" />
              ) : isPublished ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600 group-hover:bg-rose-600 transition-colors" />
                  </span>
                  <span className="group-hover:hidden font-medium">Published</span>
                  <span className="hidden group-hover:inline-flex items-center gap-1 font-medium text-rose-700">
                     Unpublish
                  </span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-500 group-hover:bg-emerald-600 transition-colors" />
                  <span className="group-hover:hidden font-medium">Draft</span>
                  <span className="hidden group-hover:inline-flex items-center gap-1 font-medium text-emerald-800">
                    <Globe size={12} /> Publish
                  </span>
                </>
              )}
            </button>

            {row.slug && (
              <a
                href={`/${row.slug === "home" ? "" : row.slug}`}
                target="_blank"
                rel="noreferrer"
                title={`Visit /${row.slug}`}
                className="grid h-7 w-7 place-items-center rounded-lg glass-pill text-stone-500 hover:text-stone-900 hover:bg-white/80 transition-all cursor-pointer"
              >
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        kicker="Management"
        title="Pages"
        description="Create and update website pages, configure URL slugs, page types, assigned sections, and SEO tags."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              className="glass-btn-primary rounded-full px-4.5 py-2 text-xs font-medium cursor-pointer"
              onPress={onAdd}
            >
              <Plus size={15} /> Add Page
            </Button>
          </div>
        }
      />

      {pagesQuery.isLoading && (
        <div className="glass-panel rounded-2xl p-8 text-center text-sm text-stone-500">
          Loading pages…
        </div>
      )}

      {pagesQuery.isError && (
        <div className="glass-panel rounded-2xl p-6 text-center text-sm text-rose-600 border-rose-200/60 mb-6">
          {pagesQuery.error?.message || "Could not load pages"}
        </div>
      )}

      {!pagesQuery.isLoading && (
        <DataTable
          label="Pages"
          rows={pages}
          columns={columns}
          empty="No pages created yet. Click 'Add Page' to create your first page."
          onEdit={onEdit}
          onDelete={onDeletePrompt}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        title={`Delete "${pageToDelete?.title || "page"}"?`}
        body="This will permanently delete this page record from the database."
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={onConfirmDelete}
        pending={pageAction.isPending}
      />
    </div>
  );
}
