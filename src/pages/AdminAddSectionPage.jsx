import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import { ArrowLeft, Check, Image as ImageIcon, Layers, LayoutList, Link2, ListPlus, Save, Tag, Trash2, Type, User, Hash, AlignLeft, BarChart3 } from "lucide-react";
import { toast } from "react-toastify";
import { AreaControl, RichTextControl, TextControl } from "@/components/Fields";
import { PageHeader } from "@/components/PageBits";
import { blankItem, itemIsEmpty } from "@/landing/payload";
import { useAdminSections, useSaveAdminSection } from "@/landing/sectionQueries";
import { PreviewImage } from "@/pages/LandingSectionPage";
import { ITEM_FIELD_TYPES, fieldKindLabel, findSection, forgetItemFields, genericSection, isSectionSlug, itemFieldsByKeys, landingSections, rememberItemFields, sectionSlug, serializeItemFields } from "@/landing/sections";

const FIELD_ICONS = {
  title: Type,
  description: AlignLeft,
  image: ImageIcon,
  link: Link2,
  number: Hash,
  category: Tag,
  name: User,
  label: Tag,
  value: BarChart3,
  icon: LayoutList,
  message: AlignLeft,
};

function FieldIcon({ fieldKey, size = 15 }) {
  const Icon = FIELD_ICONS[fieldKey] ?? LayoutList;
  return <Icon size={size} strokeWidth={1.8} />;
}

function StepCard({ step, title, hint, children }) {
  return (
    <section className="glass-card overflow-hidden rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <header className="flex items-center gap-3 border-b border-white/50 bg-white/40 px-5 py-4 md:px-6">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-stone-900 text-[11px] font-semibold text-amber-200">
          {step}
        </span>
        <div className="min-w-0">
          <h2 className="font-serif text-xl leading-tight text-ink">{title}</h2>
          {hint ? <p className="mt-0.5 text-xs text-stone-500">{hint}</p> : null}
        </div>
      </header>
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}

const BLOCKED_ITEM_KEYS = new Set(["category", "message"]);

function allowedItemFields(fields) {
  return (fields ?? []).filter((field) => !BLOCKED_ITEM_KEYS.has(field.key));
}

function messageFromApi(error, fallback) {
  const data = error?.response?.data;
  const details = Array.isArray(data?.errors) ? data.errors.map((item) => item.message).filter(Boolean) : [];
  if (details.length) return details.join(". ");
  return data?.message || error?.message || fallback;
}

function contentFor(kind, itemFields) {
  const section = kind === "custom" ? genericSection("custom", "Section", 0, itemFields ?? []) : findSection(kind);
  if (!section) return null;
  const settings = {};
  for (const field of section.settings ?? []) settings[field.key] = "";
  return {
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    settings,
    file: null,
    items: section.itemFields?.length ? [blankItem(section)] : [],
  };
}

export function AdminAddSectionPage() {
  const navigate = useNavigate();
  const saved = useAdminSections();
  const saveSection = useSaveAdminSection();
  const [name, setName] = useState("");
  const [order, setOrder] = useState("0");
  const [orderTouched, setOrderTouched] = useState(false);
  const [picked, setPicked] = useState([]);
  const [content, setContent] = useState(null);
  const [typeChoice, setTypeChoice] = useState("");

  const slug = sectionSlug(name);
  const autoSection = isSectionSlug(slug) ? findSection(slug) : null;
  const autoType = autoSection ? autoSection.key : isSectionSlug(slug) ? "custom" : "";
  const typeKey = typeChoice || autoType;
  const known = typeKey && typeKey !== "custom" ? findSection(typeKey) : null;
  const pickedFields = allowedItemFields(itemFieldsByKeys(picked));
  const section = known ?? (typeKey === "custom" && isSectionSlug(slug) ? genericSection(slug, name.trim() || slug, Number(order) || 0, pickedFields) : null);
  const kind = known?.key ?? (section ? "custom" : "");
  const pickedKey = pickedFields.map((field) => field.key).join(",");
  const itemFields = pickedFields.length ? pickedFields : allowedItemFields(section?.itemFields ?? []);
  const itemSection = section ? { ...section, itemFields } : null;
  const taken = Boolean(slug) && (saved.data ?? []).some((row) => row.name === name.trim() && name.trim());

  useEffect(() => {
    if (orderTouched || !saved.data) return;
    const max = saved.data.reduce((highest, row) => Math.max(highest, Number(row.order) || 0), -1);
    if (max >= 0) setOrder(String(max + 1));
  }, [orderTouched, saved.data]);

  useEffect(() => {
    setContent(kind ? contentFor(kind, kind === "custom" ? [] : undefined) : null);
  }, [kind]);

  useEffect(() => {
    if (!kind) {
      setPicked([]);
      return;
    }
    if (kind === "custom") return;
    const base = allowedItemFields(findSection(kind)?.itemFields ?? []);
    setPicked(base.map((field) => field.key));
  }, [kind]);

  useEffect(() => {
    if (!kind) return;
    const base = kind === "custom" ? [] : allowedItemFields(findSection(kind)?.itemFields ?? []);
    const fields = pickedFields.length ? pickedFields : base;
    const draft = { ...(findSection(kind) ?? genericSection(kind, "Section", 0, fields)), itemFields: fields };
    setContent((current) => {
      if (!current) return current;
      if (!fields.length) return { ...current, items: [] };
      const source = current.items.length ? current.items : [blankItem(draft)];
      const items = source.map((item) => {
        const next = blankItem(draft);
        next.id = item.id;
        next.imageFile = item.imageFile ?? null;
        next.imageUrl = item.imageUrl ?? "";
        for (const field of fields) {
          if (field.type !== "file" && item[field.key] != null) next[field.key] = item[field.key];
        }
        return next;
      });
      return { ...current, items };
    });
  }, [kind, pickedKey]);

  function updateItem(id, patch) {
    setContent((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }

  function buildPayload() {
    const items = (content.items ?? [])
      .filter((item) => !itemIsEmpty(itemSection, item))
      .map((item) => {
        const next = {};
        for (const field of itemFields) {
          if (field.type === "file") next[field.key] = item.imageUrl || "";
          else next[field.key] = item[field.key] ?? "";
        }
        return next;
      });

    const payloadContent = {
      title: content.title ?? "",
      subtitle: content.subtitle ?? "",
      description: content.description ?? "",
      image: "",
      button: { text: content.buttonText ?? "", link: content.buttonLink ?? "" },
    };

    const payload = {
      name: name.trim(),
      type: section.key,
      order: Number(order) || 0,
      status: "active",
      content: payloadContent,
    };
    if (items.length) payload.items = items;
    if (section.custom) {
      payload.settings = { itemFields: serializeItemFields(section.itemFields) };
    }
    return payload;
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!section || !content || taken) return;
    try {
      const body = await saveSection.mutateAsync(buildPayload());
      if (section.custom) rememberItemFields(section.key, section.itemFields);
      else forgetItemFields(section.key);
      toast.success(body?.message || `${name.trim()} saved`);
      navigate("/sections");
    } catch (err) {
      toast.error(messageFromApi(err, "Could not save this section"));
    }
  }

  return (
    <div>
      <PageHeader
        kicker="Management"
        title="Add section"
        description="Name the section, fill in its content, pick item field types, then add items."
        action={
          <Button
            variant="outline"
            className="glass-btn-outline rounded-full px-4 py-1.5 text-xs font-medium cursor-pointer"
            onPress={() => navigate("/sections")}
          >
            <ArrowLeft size={14} /> Back to sections
          </Button>
        }
      />
      <form className="flex flex-col gap-6 pb-24" onSubmit={onSubmit}>
        <StepCard
          step="1"
          title="Section"
          hint="Name and placement on the page"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextControl
              label="Section name"
              value={name}
              onChange={setName}
              placeholder="FAQ"
            />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-700">Section type</label>
              <select
                value={typeKey}
                onChange={(event) => setTypeChoice(event.target.value)}
                className="glass-panel w-full rounded-xl border border-white/65 px-3 py-2 text-sm text-ink outline-none focus:border-amber-600 focus:bg-white/80 transition-colors"
              >
                {!typeKey ? <option value="">Pick a type…</option> : null}
                {landingSections.map((entry) => (
                  <option key={entry.key} value={entry.key}>
                    {entry.name}
                  </option>
                ))}
                <option value="custom">Custom section</option>
              </select>
            </div>
            <TextControl
              label="Order"
              type="number"
              value={order}
              onChange={(value) => {
                setOrderTouched(true);
                setOrder(value);
              }}
            />
          </div>
          {section ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-900/20 bg-amber-50/70 px-3 py-1 text-xs font-medium text-amber-900">
                <Layers size={12} /> Type: {section.key}
              </span>
              {known ? (
                <span className="text-xs text-stone-500">
                  uses the {known.name} fields
                </span>
              ) : section?.custom ? (
                <span className="text-xs text-stone-500">
                  choose the item fields below
                </span>
              ) : null}
            </div>
          ) : name.trim() ? (
            <p className="mt-4 text-sm text-stone-500">
              Pick a section type to continue.
            </p>
          ) : null}
          {taken ? (
            <p className="mt-3 rounded-xl border border-rose-200/70 bg-rose-50/70 px-3 py-2 text-sm text-rose-700">
              A section with this name already exists.
            </p>
          ) : null}
        </StepCard>

        {content && section ? (
          <StepCard
            step="2"
            title="Content"
            hint="Headline, copy, button and image"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {(section.scalars ?? []).map((key) =>
                key === "description" ? (
                  <div key={key} className="sm:col-span-2">
                    <RichTextControl
                      label="Description"
                      value={content.description}
                      onChange={(description) =>
                        setContent((current) => ({ ...current, description }))
                      }
                    />
                  </div>
                ) : (
                  <TextControl
                    key={key}
                    label={key === "subtitle" ? "Subtitle" : "Title"}
                    value={content[key]}
                    onChange={(value) =>
                      setContent((current) => ({ ...current, [key]: value }))
                    }
                  />
                ),
              )}
              {section.button ? (
                <>
                  <TextControl
                    label="Button text"
                    value={content.buttonText}
                    onChange={(buttonText) =>
                      setContent((current) => ({ ...current, buttonText }))
                    }
                  />
                  <TextControl
                    label="Button link"
                    value={content.buttonLink}
                    onChange={(buttonLink) =>
                      setContent((current) => ({ ...current, buttonLink }))
                    }
                  />
                </>
              ) : null}
              {(section.settings ?? []).map((field) => (
                <TextControl
                  key={field.key}
                  label={field.label}
                  value={content.settings[field.key] ?? ""}
                  onChange={(value) =>
                    setContent((current) => ({
                      ...current,
                      settings: { ...current.settings, [field.key]: value },
                    }))
                  }
                />
              ))}
              {section.file ? (
                <label className="flex flex-col gap-2 text-sm sm:col-span-2">
                  <span>{section.file.label}</span>
                  <input
                    key={kind}
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-xl file:border-0 file:bg-sand file:px-3 file:py-2 file:text-sm file:text-ink"
                    onChange={(event) =>
                      setContent((current) => ({
                        ...current,
                        file: event.target.files?.[0] ?? null,
                      }))
                    }
                  />
                  <PreviewImage file={content.file} className="h-28" />
                  <span className="text-xs text-stone-500">
                    {content.file ? content.file.name : "No image yet"}
                  </span>
                </label>
              ) : null}
            </div>
          </StepCard>
        ) : null}

        {section && !taken ? (
          <StepCard
            step="3"
            title="Item fields"
            hint="Choose which field types each item can have"
          >
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {ITEM_FIELD_TYPES.filter(
                (field) => !BLOCKED_ITEM_KEYS.has(field.key),
              ).map((field) => {
                const selected = picked.includes(field.key);
                return (
                  <button
                    key={field.key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      setPicked((current) =>
                        current.includes(field.key)
                          ? current.filter((key) => key !== field.key)
                          : [...current, field.key],
                      )
                    }
                    className={`group flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all ${
                      selected
                        ? "border-amber-900/40 bg-stone-900 text-white shadow-md shadow-stone-900/20 ring-1 ring-amber-400/30"
                        : "glass-pill text-ink hover:border-amber-900/25 hover:bg-white/80"
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors ${
                        selected
                          ? "bg-amber-400/20 text-amber-200"
                          : "bg-stone-100 text-stone-500 group-hover:text-amber-700"
                      }`}
                    >
                      <FieldIcon fieldKey={field.key} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">
                        {field.label}
                      </span>
                      <span
                        className={`mt-0.5 block text-xs ${selected ? "text-amber-200/80" : "text-stone-500"}`}
                      >
                        {fieldKindLabel(field)}
                      </span>
                    </span>
                    {selected ? (
                      <Check size={15} className="shrink-0 text-amber-300" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </StepCard>
        ) : null}

        {content?.items.map((item, index) => (
          <StepCard
            key={item.id}
            step={`4.${index + 1}`}
            title={`Item ${index + 1}`}
            hint={
              itemFields.map((field) => field.label).join(" · ") ||
              "No fields selected"
            }
          >
            <div className="flex justify-end">
              <Button
                isIconOnly
                size="sm"
                aria-label={`Remove item ${index + 1}`}
                variant="ghost"
                className="rounded-full hover:bg-rose-100/60 hover:text-rose-700 text-stone-500"
                onPress={() =>
                  setContent((current) => ({
                    ...current,
                    items: current.items.filter(
                      (entry) => entry.id !== item.id,
                    ),
                  }))
                }
              >
                <Trash2 size={15} />
              </Button>
            </div>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {itemFields.map((field) => {
                if (field.type === "file") {
                  return (
                    <label
                      key={field.key}
                      className="flex flex-col gap-2 text-sm sm:col-span-2"
                    >
                      <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-stone-600 uppercase">
                        <FieldIcon fieldKey={field.key} size={13} />{" "}
                        {field.label}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-xl file:border-0 file:bg-sand file:px-3 file:py-2 file:text-sm file:text-ink"
                        onChange={(event) =>
                          updateItem(item.id, {
                            imageFile: event.target.files?.[0] ?? null,
                          })
                        }
                      />
                      <PreviewImage file={item.imageFile} className="h-28" />
                      <span className="text-xs text-stone-500">
                        {item.imageFile ? item.imageFile.name : "No image yet"}
                      </span>
                    </label>
                  );
                }
                if (field.key === "description") {
                  return (
                    <RichTextControl
                      key={field.key}
                      label={field.label}
                      value={item[field.key] ?? ""}
                      onChange={(value) =>
                        updateItem(item.id, { [field.key]: value })
                      }
                    />
                  );
                }
                if (field.type === "area") {
                  return (
                    <div key={field.key} className="sm:col-span-2">
                      <AreaControl
                        label={field.label}
                        value={item[field.key] ?? ""}
                        onChange={(value) =>
                          updateItem(item.id, { [field.key]: value })
                        }
                      />
                    </div>
                  );
                }
                return (
                  <TextControl
                    key={field.key}
                    label={field.label}
                    value={item[field.key] ?? ""}
                    onChange={(value) =>
                      updateItem(item.id, { [field.key]: value })
                    }
                  />
                );
              })}
            </div>
          </StepCard>
        ))}

        <div className="glass-card sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5 shadow-[0_12px_40px_rgb(0,0,0,0.12)]">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              className="rounded-full px-3 py-1.5 text-xs font-medium text-stone-500 hover:bg-white/70 hover:text-stone-800 cursor-pointer"
              onPress={() => navigate("/sections")}
            >
              <ArrowLeft size={14} /> Back
            </Button>
            <span className="hidden h-5 w-px bg-stone-300/50 sm:block" aria-hidden="true" />
            {content && itemFields.length ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-dashed border-amber-900/30 bg-amber-50/40 px-4 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100/60 cursor-pointer"
                onPress={() =>
                  setContent((current) => ({
                    ...current,
                    items: [...current.items, blankItem(itemSection)],
                  }))
                }
              >
                <ListPlus size={14} /> Add item
              </Button>
            ) : null}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100/80 px-3 py-1 text-[11px] font-medium text-stone-600">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {content?.items?.length
                ? `${content.items.length} item${content.items.length === 1 ? "" : "s"}`
                : "No items"}
            </span>
          </div>
          <Button
            type="submit"
            variant="primary"
            className="glass-btn-primary rounded-full px-6 py-2 text-sm font-medium cursor-pointer"
            isDisabled={!section || taken || !name.trim()}
            isPending={saveSection.isPending}
          >
            <Save size={15} /> Save section
          </Button>
        </div>
      </form>
    </div>
  );
}
