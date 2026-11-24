import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "@/utils/userRequest";

export const pageKeys = {
  all: ["admin-pages"],
  detail: (id) => ["admin-pages", id],
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
 * Fetch all pages from /api/admin/page
 */
export function useAdminPages() {
  return useQuery({
    queryKey: pageKeys.all,
    queryFn: async () => {
      try {
        const response = await newRequest.get("/api/admin/page");
        const body = assertOk(response, "Could not load pages");
        const data = body?.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.items)) return data.items;
        if (Array.isArray(data?.pages)) return data.pages;
        return [];
      } catch (err) {
        // If 404, return empty list gracefully
        if (err.response?.status === 404) return [];
        throw err;
      }
    },
  });
}

/**
 * Fetch a single page by ID
 */
export function useAdminPage(id) {
  return useQuery({
    queryKey: pageKeys.detail(id),
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await newRequest.get(`/api/admin/page/${id}`);
      const body = assertOk(response, "Could not load this page");
      return body?.data ?? null;
    },
  });
}

/**
 * Add or update a page via PUT /api/admin/page
 * Omit id to add; send id to update.
 */
export function useSavePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const body = { ...payload };
      // Leave id out to add a record. Send id to update that record.
      if (!body.id) {
        delete body.id;
      }
      const response = await newRequest.put("/api/admin/page", body);
      return assertOk(response, "Could not save this page");
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: pageKeys.all });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: pageKeys.detail(variables.id) });
      }
    },
  });
}

/**
 * Perform page actions: "publish", "unpublish", "delete", "sections"
 */
export function usePageAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action }) => {
      const response = await newRequest.put("/api/admin/page", { id, action });
      return assertOk(response, `Could not ${action} this page`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageKeys.all });
    },
  });
}
