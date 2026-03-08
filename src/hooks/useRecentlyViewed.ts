import { useState, useEffect, useCallback } from "react";

export interface RecentlyViewedItem {
  serviceId: string;
  serviceName: string;
  categorySlug: string;
  serviceSlug: string;
  viewedAt: number;
}

const STORAGE_KEY = "recently_viewed_services";
const MAX_ITEMS = 4;

function getItems(): RecentlyViewedItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addRecentlyViewed(item: Omit<RecentlyViewedItem, "viewedAt">) {
  const items = getItems().filter((i) => i.serviceId !== item.serviceId);
  items.unshift({ ...item, viewedAt: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  window.dispatchEvent(new Event("recently-viewed-updated"));
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>(getItems);

  const refresh = useCallback(() => setItems(getItems()), []);

  useEffect(() => {
    window.addEventListener("recently-viewed-updated", refresh);
    return () => window.removeEventListener("recently-viewed-updated", refresh);
  }, [refresh]);

  return items;
}
