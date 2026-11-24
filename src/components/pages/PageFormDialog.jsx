import { useEffect, useState } from "react";
import { Button, Input, Label, Modal, TextField } from "@heroui/react";
import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Globe,
  HardHat,
  HelpCircle,
  Image,
  Info,
  Layers,
  ListOrdered,
  Megaphone,
  PanelBottom,
  PanelTop,
  Phone,
  Quote,
  Search,
  Sparkles,
  Wrench,
} from "lucide-react";
import { toast } from "react-toastify";
import { useSavePage } from "@/landing/pageQueries";
import { useLandingSections } from "@/landing/queries";

export const SECTION_ICONS = {
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
  faq: HelpCircle,
};

export const PAGE_TYPES = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "contact", label: "Contact" },
  { id: "blogs", label: "Blogs" },
  { id: "faq", label: "FAQ" },
  { id: "privacy", label: "Privacy Policy" },
  { id: "terms", label: "Terms of Service" },
  { id: "custom", label: "Custom Page" },
];

export const PAGE_STATUSES = [
  { id: "published", label: "Published" },
  { id: "draft", label: "Draft" },
  { id: "archived", label: "Archived" },
];

function slugify(text) {
  return String(text ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function PageFormDialog({ open, onOpenChange, page = null }) {
  const isEdit = Boolean(page?._id || page?.id);
  const savePage = useSavePage();
  const landingSectionsQuery = useLandingSections();
  const availableSections = Array.isArray(landingSectionsQuery.data) ? landingSectionsQuery.data : [];

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [pageType, setPageType] = useState("home");
  const [status, setStatus] = useState("published");
  const [selectedSections, setSelectedSections] = useState([]);
  const [seoOpen, setSeoOpen] = useState(false);
  const [seo, setSeo] = useState({
    metaTitle: "",
    metaDescription: "",
    keywords: "",
  });

  useEffect(() => {
    if (!open) return;
    if (page) {
      setTitle(page.title || "");
      setSlug(page.slug || "");
      setSlugTouched(true);
      setPageType(page.pageType || "home");
      setStatus(page.status || "published");
      const initialSections = (page.sections ?? []).map((sec, idx) => {
        const secId =
          typeof sec.section === "object"
            ? sec.section?._id || sec.section?.id
            : typeof sec === "object"
              ? sec.section || sec._id || sec.id
              : sec;
        return {
          section: String(secId),
          order: typeof sec.order === "number" ? sec.order : idx,
        };
      });
      setSelectedSections(initialSections);

      const enSeo = page.seo?.en || page.seo || {};
      setSeo({
        metaTitle: enSeo.metaTitle || enSeo.title || "",
        metaDescription: enSeo.metaDescription || enSeo.description || "",
        keywords: Array.isArray(enSeo.keywords) ? enSeo.keywords.join(", ") : enSeo.keywords || "",
      });
      setSeoOpen(Boolean(enSeo.metaTitle || enSeo.metaDescription || enSeo.keywords));
    } else {
      setTitle("");
      setSlug("");
      setSlugTouched(false);
      setPageType("home");
      setStatus("published");
      setSelectedSections([]);
      setSeo({ metaTitle: "", metaDescription: "", keywords: "" });
      setSeoOpen(false);
    }
  }, [open, page]);

  function onTitleChange(val) {
    setTitle(val);
    if (!slugTouched && !isEdit) {
      setSlug(slugify(val));
    }
  }

  function toggleSection(sectionId) {
    setSelectedSections((current) => {
      const exists = current.some((s) => s.section === sectionId);
      if (exists) {
        return current.filter((s) => s.section !== sectionId);
      }
      return [...current, { section: sectionId, order: current.length }];
    });
  }

  function moveSectionOrder(index, direction) {
    setSelectedSections((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.length) return current;
      const copy = [...current];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy.map((item, idx) => ({ ...item, order: idx }));
    });
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!title.trim() || !slug.trim() || !pageType.trim()) {
      toast.error("Please fill in Title, Slug, and Page Type");
      return;
    }

    const keywordsArr = seo.keywords
      ? seo.keywords.split(",").map((k) => k.trim()).filter(Boolean)
      : [];

    const payload = {
      title: title.trim(),
      slug: slugify(slug),
      pageType: pageType.trim().toLowerCase(),
      status,
      sections: selectedSections.map((sec, idx) => ({
        section: String(sec.section),
        order: typeof sec.order === "number" ? sec.order : idx,
      })),
      seo: {
        ...(page?.seo || {}),
        en: {
          ...(page?.seo?.en || {}),
          metaTitle: seo.metaTitle.trim(),
          metaDescription: seo.metaDescription.trim(),
          keywords: keywordsArr,
        },
      },
    };

    if (isEdit) {
      payload.id = page._id || page.id;
    }

    try {
      const result = await savePage.mutateAsync(payload);
      toast.success(result?.message || (isEdit ? "Page updated" : "Page created"));
      onOpenChange(false);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to save page";
      toast.error(msg);
    }
  }

  return (
    <Modal isOpen={open} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="glass-modal w-[90vw] max-w-[90vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <Modal.CloseTrigger />
            <Modal.Header className="pb-3 border-b border-white/40">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-400/20 text-amber-800 border border-amber-400/30">
                  <Globe size={16} />
                </div>
                <div>
                  <Modal.Heading className="font-serif text-2xl text-ink leading-tight">
                    {isEdit ? "Edit page" : "Create new page"}
                  </Modal.Heading>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Configure page path, assigned sections, and SEO metadata.
                  </p>
                </div>
              </div>
            </Modal.Header>

            <form onSubmit={onSubmit} className="flex flex-col gap-5 pt-4">
              {/* Basic Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField value={title} onChange={onTitleChange} isRequired>
                  <Label className="text-xs font-medium text-stone-700">Page Title</Label>
                  <Input placeholder="e.g. Home, About Us, Services" />
                </TextField>

                <TextField
                  value={slug}
                  onChange={(val) => {
                    setSlugTouched(true);
                    setSlug(val);
                  }}
                  isRequired
                >
                  <Label className="text-xs font-medium text-stone-700">URL Slug</Label>
                  <div className="relative flex items-center ">
                    <span className="absolute left-3 text-xs text-stone-400 select-none">/</span>
                    <Input className="pl-6 w-full" placeholder="home" />
                  </div>
                </TextField>
              </div>

              {/* Page Type & Status */}
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField value={pageType} onChange={setPageType} isRequired>
                  <Label className="text-xs font-medium text-stone-700">Page Type</Label>
                  <Input placeholder="e.g. home, about, services, custom" list="page-type-suggestions" />
                  <datalist id="page-type-suggestions">
                    {PAGE_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </datalist>
                </TextField>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1.5">Publish Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="glass-panel w-full rounded-xl border border-white/65 px-3 py-2 text-sm text-ink outline-none focus:border-amber-600 focus:bg-white/80 transition-colors"
                  >
                    {PAGE_STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sections Assignment */}
              <div className="glass-panel rounded-2xl p-4 border border-white/60">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Layers size={15} className="text-amber-800" />
                    <span className="text-sm font-semibold text-ink">Assigned Sections</span>
                  </div>
                  <span className="text-xs text-stone-500">
                    {selectedSections.length} {selectedSections.length === 1 ? "section" : "sections"} assigned
                  </span>
                </div>

                {availableSections.length === 0 ? (
                  <p className="text-xs text-stone-500 py-3 text-center">
                    No landing sections found. Create sections in the Section Builder first.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                    {availableSections.map((sec, idx) => {
                      const sectionId = sec._id || sec.id || sec.sectionKey;
                      const selectedIndex = selectedSections.findIndex((s) => s.section === sectionId);
                      const isSelected = selectedIndex !== -1;
                      const SecIcon = SECTION_ICONS[sec.type || sec.sectionKey] || Layers;

                      return (
                        <div
                          key={sectionId}
                          className={`group relative flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all duration-200 ${
                            isSelected
                              ? "bg-amber-50/80 border-amber-300 shadow-xs shadow-amber-950/5 ring-1 ring-amber-400/30"
                              : "bg-white/50 border-white/80 text-stone-600 hover:bg-white/80 hover:border-stone-300/80 hover:shadow-2xs"
                          }`}
                        >
                          <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 select-none">
                            {/* Custom Styled Checkbox */}
                            <div
                              className={`relative w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all duration-200 ${
                                isSelected
                                  ? "bg-gradient-to-br from-amber-600 to-amber-700 border-amber-600 text-white shadow-xs shadow-amber-900/20 scale-105"
                                  : "border-stone-300/80 bg-white/80 group-hover:border-amber-400 group-hover:bg-white"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSection(sectionId)}
                                className="sr-only"
                              />
                              <Check
                                size={12}
                                strokeWidth={3}
                                className={`transition-transform duration-150 ${
                                  isSelected ? "scale-100 opacity-100" : "scale-50 opacity-0"
                                }`}
                              />
                            </div>

                            {/* Section Type Icon */}
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                                isSelected
                                  ? "bg-amber-100/90 text-amber-800 border-amber-300/60 shadow-2xs"
                                  : "bg-stone-100/80 text-stone-400 border-stone-200/60 group-hover:text-stone-700 group-hover:bg-stone-100"
                              }`}
                            >
                              <SecIcon size={15} />
                            </div>

                            {/* Section Info */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p
                                  className={`text-xs font-semibold truncate transition-colors ${
                                    isSelected ? "text-amber-950" : "text-ink group-hover:text-amber-900"
                                  }`}
                                >
                                  {sec.name || sec.sectionName || sec.type || sec.sectionKey}
                                </p>

                                {sec.status && (
                                  <span
                                    className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-medium tracking-wide uppercase shrink-0 ${
                                      sec.status === "active"
                                        ? "bg-emerald-100/80 text-emerald-800 border border-emerald-200/60"
                                        : "bg-stone-200/70 text-stone-600 border border-stone-300/50"
                                    }`}
                                  >
                                    {sec.status === "active" && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                    )}
                                    {sec.status}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-medium text-stone-500 capitalize bg-white/70 px-1.5 py-0.2 rounded border border-stone-200/60">
                                  {sec.type || sec.sectionKey}
                                </span>
                                {sec.content?.title ? (
                                  <span className="text-[10px] text-stone-400 truncate max-w-[220px]" title={sec.content.title}>
                                    &ldquo;{sec.content.title}&rdquo;
                                  </span>
                                ) : sec.content?.subtitle ? (
                                  <span className="text-[10px] text-stone-400 truncate max-w-[220px]" title={sec.content.subtitle}>
                                    {sec.content.subtitle}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </label>

                          {/* Reorder and Sequence Badge */}
                          {isSelected && (
                            <div className="flex items-center gap-1.5 shrink-0 pl-2.5 border-l border-amber-200/60">
                              <span
                                title={`Assigned Position #${selectedIndex + 1}`}
                                className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-200/70 text-amber-900 border border-amber-300/80 shadow-2xs"
                              >
                                #{selectedIndex + 1}
                              </span>
                              <div className="flex items-center gap-0.5">
                                <Button
                                  isIconOnly
                                  variant="ghost"
                                  size="sm"
                                  aria-label="Move section up"
                                  className="h-6 w-6 text-stone-500 hover:text-amber-900 hover:bg-amber-200/50 rounded-md disabled:opacity-20"
                                  isDisabled={selectedIndex === 0}
                                  onPress={() => moveSectionOrder(selectedIndex, -1)}
                                >
                                  <ArrowUp size={12} strokeWidth={2.4} />
                                </Button>
                                <Button
                                  isIconOnly
                                  variant="ghost"
                                  size="sm"
                                  aria-label="Move section down"
                                  className="h-6 w-6 text-stone-500 hover:text-amber-900 hover:bg-amber-200/50 rounded-md disabled:opacity-20"
                                  isDisabled={selectedIndex === selectedSections.length - 1}
                                  onPress={() => moveSectionOrder(selectedIndex, 1)}
                                >
                                  <ArrowDown size={12} strokeWidth={2.4} />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SEO Collapsible Section */}
              <div className="glass-panel rounded-2xl border border-white/60 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSeoOpen((v) => !v)}
                  className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-white/40"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-amber-800" />
                    <span className="text-sm font-semibold text-ink">Search Engine Optimization (SEO)</span>
                  </div>
                  {seoOpen ? <ChevronUp size={16} className="text-stone-500" /> : <ChevronDown size={16} className="text-stone-500" />}
                </button>

                {seoOpen && (
                  <div className="grid gap-3.5 px-4 pb-4 pt-1 border-t border-white/40">
                    <TextField
                      value={seo.metaTitle}
                      onChange={(metaTitle) => setSeo((cur) => ({ ...cur, metaTitle }))}
                    >
                      <Label className="text-xs font-medium text-stone-700">Meta Title</Label>
                      <Input
                        placeholder="Custom browser tab and search title"
                        className="w-full rounded-xl border border-stone-200/80 bg-white/70 px-3 py-2 text-sm text-ink placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-400/60 focus:border-amber-400/60 transition"
                      />
                    </TextField>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">Meta Description</label>
                      <textarea
                        value={seo.metaDescription}
                        onChange={(e) => setSeo((cur) => ({ ...cur, metaDescription: e.target.value }))}
                        rows={2}
                        placeholder="Brief summary for search engine results..."
                        className="w-full rounded-xl border border-stone-200/80 bg-white/70 px-3 py-2 text-sm text-ink placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-400/60 focus:border-amber-400/60 transition resize-none"
                      />
                    </div>

                    <TextField
                      value={seo.keywords}
                      onChange={(keywords) => setSeo((cur) => ({ ...cur, keywords }))}
                    >
                      <Label className="text-xs font-medium text-stone-700">Keywords</Label>
                      <Input
                        placeholder="construction, contractor, roofing, seattle"
                        className="w-full rounded-xl border border-stone-200/80 bg-white/70 px-3 py-2 text-sm text-ink placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-400/60 focus:border-amber-400/60 transition"
                      />
                    </TextField>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <Modal.Footer className="pt-2 flex justify-end gap-2.5">
                <Button slot="close" variant="ghost" className="rounded-full text-xs hover:bg-white/60">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="glass-btn-primary rounded-full px-5 py-2 text-xs font-medium cursor-pointer"
                  isPending={savePage.isPending}
                >
                  {isEdit ? "Update Page" : "Create Page"}
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
