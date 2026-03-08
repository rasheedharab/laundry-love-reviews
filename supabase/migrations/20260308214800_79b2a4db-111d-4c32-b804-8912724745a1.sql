
CREATE OR REPLACE FUNCTION public.get_slot_availability(p_date date, p_slots text[])
RETURNS TABLE(time_slot text, booked_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT
    s.slot AS time_slot,
    COALESCE(COUNT(o.id), 0) AS booked_count
  FROM unnest(p_slots) AS s(slot)
  LEFT JOIN public.orders o
    ON o.pickup_date = p_date
    AND o.pickup_time_slot = s.slot
    AND o.status NOT IN ('cancelled')
  GROUP BY s.slot;
$$;
