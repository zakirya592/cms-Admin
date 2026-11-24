import { useEffect, useState } from "react";
import { Button, Input, Label, Modal, TextField } from "@heroui/react";
import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronUp,
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
  Sparkles,
  Wrench,
  Users,
  Star,
  BarChart2,
  Grid,
  Tag,
  Handshake,
} from "lucide-react";
import { toast } from "react-toastify";
import { useSaveAdminSection } from "@/landing/sectionQueries";

// ── Section type registry ──────────────────────────────────────────────────
export const SECTION_TYPES = [
  "header", "hero", "about", "services", "features", "statistics",
  "testimonials", "team", "gallery", "pricing", "faq", "contact",
  "cta", "partners", "footer", "projects", "process", "why-us", "custom",
];

export const SECTION_ICONS = {
  header: PanelTop,
  hero: Image,
  about: Info,
  services: Wrench,
  features: Star,
  statistics: BarChart2,
  testimonials: Quote,
  team: Users,
  gallery: Grid,
  pricing: Tag,
  faq: HelpCircle,
  contact: Phone,
  cta: Megaphone,
  partners: Handshake,
  footer: PanelBottom,
  projects: HardHat,
  process: ListOrdered,
  "why-us": BadgeCheck,
  custom: Layers,
};

// ── Auto-generate name from type ───────────────────────────────────────────
function labelFromType(type) {
  if (!type) return "";
  return type
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ── Component ──────────────────────────────────────────────────────────────
export function SectionFormDialog({ open, onOpenChange, section = null }) {
  const isEdit = Boolean(section?._id || section?.id);
  const saveSection = useSaveAdminSection();

  const [name, setName] = useState("");
  const [type, setType] = useState("hero");
  const [status, setStatus] = useState("active");
  const [order, setOrder] = useState("0");
  const [contentRaw, setContentRaw] = useState("{}");
  const [settingsRaw, setSettingsRaw] = useState("{}");
  const [contentError, setContentError] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Reset/populate form when dialog opens
  useEffect(() => {
    if (!open) return;
    if (section) {
      setName(section.name || "");
      setType(section.type || "hero");
      setStatus(section.status || "active");
      setOrder(String(section.order ?? "0"));
      setContentRaw(section.content ? JSON.stringify(section.content, null, 2) : "{}");
      setSettingsRaw(section.settings ? JSON.stringify(section.settings, null, 2) : "{}");
    } else {
      setName("");
      setType("hero");
      setStatus("active");
      setOrder("0");
      setContentRaw("{}");
      setSettingsRaw("{}");
    }
    setContentError("");
    setSettingsError("");
    setAdvancedOpen(false);
  }, [open, section]);

  // Auto-fill name when type is picked (only on add, and only if name is still blank)
  function handleTypeChange(e) {
    const v = e.target.value;
    setType(v);
    if (!isEdit && !name.trim()) setName(labelFromType(v));
  }

  function validateJson(str, setter) {
    try {
      JSON.parse(str);
      setter("");
      return true;
    } catch {
      setter("Invalid JSON");
      return false;
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    const contentOk = validateJson(contentRaw, setContentError);
    const settingsOk = validateJson(settingsRaw, setSettingsError);
    if (!contentOk || !settingsOk) return;

    const payload = {
      name: name.trim(),
      type,
      status,
      order: Number(order) || 0,
      content: JSON.parse(contentRaw),
      settings: JSON.parse(settingsRaw),
    };

    const id = section?._id || section?.id;
    if (id) payload.id = id;

    try {
      const res = await saveSection.mutateAsync(payload);
      toast.success(res?.message || (isEdit ? "Section updated" : "Section created"));
      onOpenChange(false);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Could not save section";
      toast.error(msg);
    }
  }

  const SecIcon = SECTION_ICONS[type] || Layers;

  return (
    <Modal isOpen={open} onOpenChange={onOpenChange}>
      <Modal.Backdrop className="backdrop-blur-sm bg-black/20" />
      <Modal.Container className="flex items-start justify-center min-h-screen pt-10 pb-10 px-4">
        <Modal.Dialog
          className="glass-panel rounded-3xl shadow-2xl border border-white/70 w-full overflow-hidden"
          style={{ maxWidth: "90vw", width: "640px" }}
        >
          {/* Header */}
          <Modal.Header className="flex items-center gap-3 px-6 py-5 border-b border-white/40">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300/40 text-amber-800 shadow-xs">
              <SecIcon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <Modal.Title className="text-base font-semibold text-ink leading-tight">
                {isEdit ? `Edit "${section?.name || "Section"}"` : "New Section"}
              </Modal.Title>
              <p className="text-xs text-stone-500 mt-0.5">
                {isEdit ? "Update section details and content" : "Add a new section to your site"}
              </p>
            </div>
          </Modal.Header>

          {/* Body */}
          <form onSubmit={onSubmit}>
            <Modal.Body className="grid gap-4 px-6 py-5 max-h-[72vh] overflow-y-auto">

              {/* Name + Type row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name */}
                <TextField value={name} onChange={setName} isRequired>
                  <Label className="text-xs font-medium text-stone-700">Section Name</Label>
                  <Input placeholder="e.g. Hero Banner" className="text-sm" />
                </TextField>

                {/* Type */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-stone-700">Section Type</label>
                  <div className="relative">
                    <select
                      value={type}
                      onChange={handleTypeChange}
                      className="w-full h-9 rounded-xl border border-stone-200/80 bg-white/70 px-3 pr-8 text-sm text-ink appearance-none focus:outline-none focus:ring-1 focus:ring-amber-400/60 cursor-pointer capitalize"
                      required
                    >
                      {SECTION_TYPES.map((t) => (
                        <option key={t} value={t} className="capitalize">
                          {labelFromType(t)}
                        </option>
                      ))}
                    </select>
                    <SecIcon size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  </div>
                </div>
              </div>

              {/* Status + Order row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Status */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-stone-700">Status</label>
                  <div className="flex gap-2">
                    {["active", "inactive"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border text-xs font-medium transition-all capitalize cursor-pointer ${
                          status === s
                            ? s === "active"
                              ? "bg-emerald-50/80 border-emerald-300 text-emerald-900 shadow-xs"
                              : "bg-stone-100/80 border-stone-300 text-stone-700 shadow-xs"
                            : "bg-white/40 border-stone-200/60 text-stone-500 hover:bg-white/70"
                        }`}
                      >
                        {status === s && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              s === "active" ? "bg-emerald-500" : "bg-stone-400"
                            }`}
                          />
                        )}
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order */}
                <TextField value={order} onChange={setOrder}>
                  <Label className="text-xs font-medium text-stone-700">Display Order</Label>
                  <Input type="number" min="0" placeholder="0" className="text-sm" />
                </TextField>
              </div>

              {/* Advanced: Content & Settings JSON */}
              <div className="glass-panel rounded-2xl border border-white/60 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setAdvancedOpen((v) => !v)}
                  className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-white/40"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-amber-800" />
                    <span className="text-sm font-semibold text-ink">Content &amp; Settings</span>
                    <span className="text-[10px] text-stone-400 font-normal">JSON — optional</span>
                  </div>
                  {advancedOpen
                    ? <ChevronUp size={16} className="text-stone-500" />
                    : <ChevronDown size={16} className="text-stone-500" />}
                </button>

                {advancedOpen && (
                  <div className="grid gap-4 px-4 pb-4 pt-1 border-t border-white/40">
                    {/* Content JSON */}
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Content <span className="font-normal text-stone-400">(JSON object)</span>
                      </label>
                      <textarea
                        value={contentRaw}
                        onChange={(e) => {
                          setContentRaw(e.target.value);
                          setContentError("");
                        }}
                        rows={6}
                        spellCheck={false}
                        placeholder='{ "title": "...", "description": "..." }'
                        className={`w-full font-mono text-xs rounded-xl border px-3 py-2 bg-white/60 focus:outline-none focus:ring-1 focus:ring-amber-400/60 resize-y ${
                          contentError ? "border-rose-400" : "border-stone-200/80"
                        }`}
                      />
                      {contentError && (
                        <p className="mt-1 text-[11px] text-rose-600 font-medium">{contentError}</p>
                      )}
                    </div>

                    {/* Settings JSON */}
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Settings <span className="font-normal text-stone-400">(JSON object)</span>
                      </label>
                      <textarea
                        value={settingsRaw}
                        onChange={(e) => {
                          setSettingsRaw(e.target.value);
                          setSettingsError("");
                        }}
                        rows={4}
                        spellCheck={false}
                        placeholder='{ "logo": "", "phone": "" }'
                        className={`w-full font-mono text-xs rounded-xl border px-3 py-2 bg-white/60 focus:outline-none focus:ring-1 focus:ring-amber-400/60 resize-y ${
                          settingsError ? "border-rose-400" : "border-stone-200/80"
                        }`}
                      />
                      {settingsError && (
                        <p className="mt-1 text-[11px] text-rose-600 font-medium">{settingsError}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Modal.Body>

            {/* Footer */}
            <Modal.Footer className="px-6 py-4 border-t border-white/40 flex justify-end gap-2.5">
              <Button slot="close" variant="ghost" className="rounded-full text-xs hover:bg-white/60">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="glass-btn-primary rounded-full px-5 py-2 text-xs font-medium cursor-pointer"
                isPending={saveSection.isPending}
              >
                {isEdit ? "Update Section" : "Create Section"}
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  );
}
