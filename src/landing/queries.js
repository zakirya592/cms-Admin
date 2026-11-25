import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "@/utils/userRequest";

export const landingKeys = {
  all: ["landing-page"],
  section: (sectionKey) => ["landing-page", sectionKey],
};

function assertOk(response, fallback) {
  if (response.data?.status === false) {
    const error = new Error(response.data?.message || fallback);
    error.response = response;
    throw error;
  }
  return response.data;
}

function normalizeSection(item) {
  if (!item || typeof item !== "object") return item;
  const sectionKey =
    item.sectionKey ||
    item.type ||
    item.settings?.legacySectionKey ||
    (item.name ? item.name.toLowerCase().replace(/\s+/g, "-") : "");
  return {
    ...item,
    sectionKey,
    sectionName: item.sectionName || item.name || sectionKey,
    isActive: item.status ? item.status === "active" : item.isActive !== false,
  };
}

async function fetchAdminSections() {
  const response = await newRequest.get("/api/admin/section?limit=100");
  const body = assertOk(response, "Could not load sections");
  const rawItems = Array.isArray(body?.data?.items)
    ? body.data.items
    : Array.isArray(body?.data)
      ? body.data
      : [];
  return rawItems.map(normalizeSection);
}

function findAdminSection(list, sectionKey) {
  return (list ?? []).find((item) => item.sectionKey === sectionKey) ?? null;
}

async function fetchAdminSectionById(id) {
  const response = await newRequest.get(`/api/admin/section?id=${encodeURIComponent(id)}`);
  const body = assertOk(response, "Could not load this section");
  const data = body?.data;
  // Detail endpoint returns the record directly; a list wrapper has items[] of sections
  const record = data?._id || data?.type ? data : Array.isArray(data?.items) ? data.items[0] : data;
  return record && typeof record === "object" ? normalizeSection(record) : null;
}

// List records may omit items; fetch the full record by id when available
async function fetchFullSection(record) {
  const id = record?._id || record?.id;
  if (!id) return record;
  try {
    const detail = await fetchAdminSectionById(id);
    return detail ? { ...record, ...detail } : record;
  } catch {
    return record;
  }
}

// Map an admin section record to the shape the landing form expects
function adminToLanding(record) {
  if (!record) return null;
  const content = record.content && typeof record.content === "object" ? record.content : {};
  const items = Array.isArray(record.items) ? record.items : Array.isArray(content.items) ? content.items : [];
  return {
    ...record,
    sectionKey: record.sectionKey,
    sectionName: record.sectionName || record.name || record.sectionKey,
    order: record.order ?? 0,
    isActive: record.isActive,
    title: content.title ?? "",
    subtitle: content.subtitle ?? "",
    description: content.description ?? "",
    image: content.image ?? "",
    button: content.button && typeof content.button === "object" ? content.button : { text: "", link: "" },
    settings: record.settings && typeof record.settings === "object" ? record.settings : {},
    items,
  };
}

// Convert a landing-page save body (JSON object or FormData) into admin shape
function toAdminPayload(sectionKey, body, existing) {
  let source = body;
  if (body instanceof FormData) {
    source = {};
    const itemLists = {};
    body.forEach((value, key) => {
      if (value instanceof File) return;
      const itemMatch = key.match(/^items\[(\d+)\]\[(.+)\]$/);
      if (itemMatch) {
        const [, index, field] = itemMatch;
        (itemLists[index] ??= {})[field] = value;
        return;
      }
      const settingMatch = key.match(/^settings\[(.+)\]$/);
      if (settingMatch) {
        (source.settings ??= {})[settingMatch[1]] = value;
        return;
      }
      const buttonMatch = key.match(/^button\[(.+)\]$/);
      if (buttonMatch) {
        (source.button ??= {})[buttonMatch[1]] = value;
        return;
      }
      source[key] = value;
    });
    const indexes = Object.keys(itemLists).map(Number).sort((a, b) => a - b);
    if (indexes.length) source.items = indexes.map((i) => itemLists[i]);
  }

  const content = {
    title: source.title ?? "",
    subtitle: source.subtitle ?? "",
    description: source.description ?? "",
    image: source.image ?? "",
    button: {
      text: source.button?.text ?? "",
      link: source.button?.link ?? "",
    },
  };

  const payload = {
    name: (source.sectionName || sectionKey || "").trim(),
    type: sectionKey,
    order: Number(source.order ?? existing?.order ?? 0) || 0,
    status: existing?.status ?? "active",
    content,
  };
  const id = existing?._id || existing?.id;
  if (id) payload.id = id;
  if (Array.isArray(source.items) && source.items.length) payload.items = source.items;
  if (source.settings && typeof source.settings === "object") payload.settings = source.settings;
  return payload;
}

export function useLandingSections() {
  return useQuery({
    queryKey: landingKeys.all,
    queryFn: fetchAdminSections,
  });
}

export const useAdminSections = useLandingSections;

export function useLandingSection(sectionKey, { enabled = true } = {}) {
  return useQuery({
    queryKey: landingKeys.section(sectionKey),
    enabled: Boolean(sectionKey) && enabled,
    queryFn: async () => {
      const list = await fetchAdminSections();
      const record = findAdminSection(list, sectionKey);
      if (!record) {
        const error = new Error("Section not found");
        error.response = { status: 404 };
        throw error;
      }
      return adminToLanding(await fetchFullSection(record));
    },
  });
}

export function useLandingSectionDetails(sectionKeys, enabled = true) {
  const keys = Array.isArray(sectionKeys) ? sectionKeys.filter(Boolean) : [];
  return useQueries({
    queries: keys.map((sectionKey) => ({
      queryKey: landingKeys.section(sectionKey),
      enabled: enabled && Boolean(sectionKey),
      queryFn: async () => {
        const list = await fetchAdminSections();
        const record = findAdminSection(list, sectionKey);
        if (!record) return null;
        return adminToLanding(await fetchFullSection(record));
      },
    })),
  });
}

export function useSaveLandingSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sectionKey, body }) => {
      const list = await fetchAdminSections().catch(() => []);
      const existing = findAdminSection(list, sectionKey);
      const payload = toAdminPayload(sectionKey, body, existing);
      const response = await newRequest.put("/api/admin/section", payload);
      return assertOk(response, "Could not save this section");
    },
    onSuccess: (_data, { sectionKey }) => {
      queryClient.invalidateQueries({ queryKey: landingKeys.all });
      queryClient.invalidateQueries({ queryKey: landingKeys.section(sectionKey) });
      queryClient.invalidateQueries({ queryKey: ["admin-sections"] });
    },
  });
}

export function useLandingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sectionKey, isActive }) => {
      const list = await fetchAdminSections().catch(() => []);
      const existing = findAdminSection(list, sectionKey);
      const id = existing?._id || existing?.id;
      if (!id) throw new Error("Section not found");
      const response = await newRequest.put("/api/admin/section", {
        id,
        action: "status",
        status: isActive ? "active" : "inactive",
      });
      return assertOk(response, "Could not update status");
    },
    onSuccess: (_body, { sectionKey }) => {
      queryClient.invalidateQueries({ queryKey: landingKeys.all });
      queryClient.invalidateQueries({ queryKey: landingKeys.section(sectionKey) });
      queryClient.invalidateQueries({ queryKey: ["admin-sections"] });
    },
  });
}

export function useDeleteLandingSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sectionKey) => {
      const list = await fetchAdminSections().catch(() => []);
      const existing = findAdminSection(list, sectionKey);
      const id = existing?._id || existing?.id;
      if (!id) throw new Error("Section not found");
      const response = await newRequest.put("/api/admin/section", { id, action: "delete" });
      return assertOk(response, "Could not delete this section");
    },
    onSuccess: (_body, sectionKey) => {
      queryClient.setQueryData(landingKeys.section(sectionKey), null);
      queryClient.invalidateQueries({ queryKey: landingKeys.all });
      queryClient.invalidateQueries({ queryKey: ["admin-sections"] });
    },
  });
}
