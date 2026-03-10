import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SelectedOutlet {
  id: string;
  name: string;
  city: string | null;
}

interface OutletContextType {
  selectedOutlet: SelectedOutlet | null;
  setSelectedOutlet: (outlet: SelectedOutlet | null) => void;
}

const STORAGE_KEY = "wr_selected_outlet";

function loadFromStorage(): SelectedOutlet | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const OutletContext = createContext<OutletContextType>({} as OutletContextType);

export const useOutlet = () => useContext(OutletContext);

export const OutletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [selectedOutlet, setState] = useState<SelectedOutlet | null>(loadFromStorage);

  const setSelectedOutlet = useCallback((outlet: SelectedOutlet | null) => {
    setState(outlet);
    if (outlet) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(outlet));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Load from profile for logged-in users on mount (if preferred_outlet_id column exists)
  useEffect(() => {
    if (!user) return;
    const loadFromProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("preferred_outlet_id")
          .eq("user_id", user.id)
          .single();
        if (error || !data) return;
        const outletId = (data as { preferred_outlet_id?: string | null })?.preferred_outlet_id;
        if (outletId) {
          const { data: outlet } = await supabase
            .from("outlets")
            .select("id, name, city")
            .eq("id", outletId)
            .eq("is_active", true)
            .single();
          if (outlet) {
            const o = { id: outlet.id, name: outlet.name, city: outlet.city };
            setState(o);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(o));
          }
        }
      } catch {
        // preferred_outlet_id column may not exist yet; localStorage still works
      }
    };
    loadFromProfile();
  }, [user?.id]);

  return (
    <OutletContext.Provider value={{ selectedOutlet, setSelectedOutlet }}>
      {children}
    </OutletContext.Provider>
  );
};
