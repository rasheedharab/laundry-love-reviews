import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  getComplementaryCategoryNames,
  recommendationWeights,
} from "@/lib/recommendationConfig";

type Service = Tables<"services">;

interface UseCartRecommendationsOptions {
  userId: string | null | undefined;
  cartServiceIds: string[];
  cartCategoryNames: string[];
}

interface ScoredService {
  service: Service;
  score: number;
}

export function useCartRecommendations({
  userId,
  cartServiceIds,
  cartCategoryNames,
}: UseCartRecommendationsOptions) {
  const [recommendations, setRecommendations] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cartServiceIds.length) {
      setRecommendations([]);
      return;
    }

    let cancelled = false;

    async function run() {
      setLoading(true);

      try {
        // 1) Build history frequency maps (per-service and per-category) if user is logged in
        const serviceFrequency: Record<string, number> = {};
        const categoryFrequency: Record<string, number> = {};

        if (userId) {
          const { data: orders } = await supabase
            .from("orders")
            .select("id, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(10);

          if (orders && orders.length) {
            const orderIds = orders.map((o) => o.id);
            const { data: orderItems } = await supabase
              .from("order_items")
              .select("service_id, quantity")
              .in("order_id", orderIds);

            if (orderItems && orderItems.length) {
              for (const item of orderItems) {
                if (!item.service_id) continue;
                const qty = item.quantity ?? 1;
                serviceFrequency[item.service_id] =
                  (serviceFrequency[item.service_id] || 0) + qty;
              }

              const uniqueHistoryServiceIds = Array.from(
                new Set(orderItems.map((i) => i.service_id).filter(Boolean) as string[])
              );

              if (uniqueHistoryServiceIds.length) {
                const { data: historyServices } = await supabase
                  .from("services")
                  .select("id, category_id, service_categories(name)")
                  .in("id", uniqueHistoryServiceIds);

                if (historyServices) {
                  const serviceToCategory: Record<string, string | undefined> = {};
                  for (const svc of historyServices as any[]) {
                    const catName: string | undefined = svc.service_categories?.name;
                    serviceToCategory[svc.id] = catName;
                  }

                  for (const item of orderItems) {
                    if (!item.service_id) continue;
                    const catName = serviceToCategory[item.service_id];
                    if (!catName) continue;
                    const qty = item.quantity ?? 1;
                    categoryFrequency[catName] =
                      (categoryFrequency[catName] || 0) + qty;
                  }
                }
              }
            }
          }
        }

        // 2) Fetch a small pool of global candidate services with their category names
        const { data: allServices } = await supabase
          .from("services")
          .select(
            "id, name, price_standard, price_express, turnaround_standard, turnaround_express, sort_order, service_categories(name)"
          )
          .order("sort_order", { ascending: true })
          .limit(40);

        if (!allServices || !allServices.length) {
          if (!cancelled) {
            setRecommendations([]);
          }
          return;
        }

        const cartServiceIdSet = new Set(cartServiceIds);
        const cartCategoryNameSet = new Set(
          cartCategoryNames.filter(Boolean)
        );
        const complementaryNames = getComplementaryCategoryNames(
          cartCategoryNames
        );

        const scored: ScoredService[] = [];

        for (const raw of allServices as any[]) {
          const svc: Service = raw as Service;
          if (cartServiceIdSet.has(svc.id)) continue;

          const catName: string | undefined = raw.service_categories?.name;
          let score = 0;

          if (catName && complementaryNames.has(catName)) {
            score += recommendationWeights.complementaryCategory;
          }
          if (catName && categoryFrequency[catName]) {
            score += recommendationWeights.frequentCategory;
          }
          if (serviceFrequency[svc.id] && serviceFrequency[svc.id] > 1) {
            score += recommendationWeights.frequentService;
          }
          if (catName && cartCategoryNameSet.has(catName)) {
            score += recommendationWeights.sameCategory;
          }

          scored.push({ service: svc, score });
        }

        // Primary: services with a positive score
        const positive = scored.filter((s) => s.score > 0);

        const sortFn = (a: ScoredService, b: ScoredService) => {
          if (b.score !== a.score) return b.score - a.score;
          const aSort = (a.service.sort_order ?? 9999) as number;
          const bSort = (b.service.sort_order ?? 9999) as number;
          if (aSort !== bSort) return aSort - bSort;
          return a.service.name.localeCompare(b.service.name);
        };

        let chosen: Service[];

        if (positive.length) {
          positive.sort(sortFn);
          chosen = positive.slice(0, 2).map((s) => s.service);
        } else {
          // Fallback: top global services excluding those already in cart
          const fallback = scored
            .sort(sortFn)
            .map((s) => s.service)
            .slice(0, 2);
          chosen = fallback;
        }

        if (!cancelled) {
          setRecommendations(chosen);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [userId, cartServiceIds, cartCategoryNames]);

  return { recommendations, loading };
}

