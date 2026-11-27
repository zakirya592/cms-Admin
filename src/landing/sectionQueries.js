import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "@/utils/userRequest";

export const adminSectionKeys = {
  all: ["admin-sections"],
  detail: (id) => ["admin-sections", id],
};

function assertOk(response, fallback) {
  if (response.data?.status === false) {
    const error = new Error(response.data?.message || fallback);
    error.response = response;
    throw error;
  }
  return response.data;
}

/**
 * Fetch all sections from GET /api/admin/section
 */
export function useAdminSections() {
  return useQuery({
    queryKey: adminSectionKeys.all,
    queryFn: async () => {
      const response = await newRequest.get("/api/admin/section?limit=100");
      const body = assertOk(response, "Could not load sections");
      const data = body?.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.items)) return data.items;
      return [];
    },
  });
}

function toFormData(payload) {
  if (payload instanceof FormData) return payload;
  const body = new FormData();
  for (const [key, value] of Object.entries(payload ?? {})) {
    if (value === undefined || value === null) continue;
    if (value instanceof File || value instanceof Blob) {
      body.append(key, value);
    } else if (typeof value === "object") {
      body.append(key, JSON.stringify(value));
    } else {
      body.append(key, String(value));
    }
  }
  return body;
}

/**
 * Add or update a section via PUT /api/admin/section.
 * Omit `id` to add; include `id` to update.
 * The API expects multipart/form-data.
 */
export function useSaveAdminSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const body = toFormData(payload);
      const response = await newRequest.put("/api/admin/section", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return assertOk(response, "Could not save this section");
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: adminSectionKeys.all });
      // also refresh the shared landing-page sections cache used by the sidebar
      queryClient.invalidateQueries({ queryKey: ["landing-page"] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: adminSectionKeys.detail(variables.id) });
      }
    },
  });
}

/**
 * Perform section actions via PUT /api/admin/section with `action` field.
 *
 * Supported actions: "status", "reorder", "duplicate", "delete"
 */
export function useAdminSectionAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const response = await newRequest.put("/api/admin/section", payload);
      return assertOk(response, `Could not perform action on section`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminSectionKeys.all });
      queryClient.invalidateQueries({ queryKey: ["landing-page"] });
    },
  });
}
