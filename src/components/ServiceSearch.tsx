import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  type: "service" | "category";
  id: string;
  name: string;
  slug: string;
  subtitle?: string;
}

export default function ServiceSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const q = `%${query}%`;
      const [cats, svcs] = await Promise.all([
        supabase.from("service_categories").select("id, name, slug, description").ilike("name", q).limit(5),
        supabase.from("services").select("id, name, slug, service_categories(name)").ilike("name", q).limit(8),
      ]);

      const catResults: SearchResult[] = (cats.data || []).map((c) => ({
        type: "category",
        id: c.id,
        name: c.name,
        slug: c.slug,
        subtitle: c.description || "Category",
      }));

      const svcResults: SearchResult[] = (svcs.data || []).map((s: any) => ({
        type: "service",
        id: s.id,
        name: s.name,
        slug: s.slug,
        subtitle: s.service_categories?.name || "Service",
      }));

      setResults([...catResults, ...svcResults]);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (r: SearchResult) => {
    setQuery("");
    setOpen(false);
    if (r.type === "category") {
      navigate(`/services/${r.slug}`);
    } else {
      navigate(`/service/${r.slug}`);
    }
  };

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2.5 rounded-2xl glass px-4 py-3 cursor-text"
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
      >
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        {open ? (
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services, categories..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            onBlur={() => {
              if (!query) setTimeout(() => setOpen(false), 200);
            }}
          />
        ) : (
          <span className="flex-1 text-sm text-muted-foreground">Search services...</span>
        )}
        {query && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuery("");
              inputRef.current?.focus();
            }}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl glass border border-border shadow-xl max-h-[320px] overflow-y-auto"
          >
            {results.map((r) => (
              <button
                key={`${r.type}-${r.id}`}
                onMouseDown={() => handleSelect(r)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                  <Search className="h-3.5 w-3.5 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {r.type === "category" ? "Category" : r.subtitle}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && query.length >= 2 && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl glass border border-border shadow-xl p-6 text-center"
          >
            <p className="text-sm text-muted-foreground">No results for "{query}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
