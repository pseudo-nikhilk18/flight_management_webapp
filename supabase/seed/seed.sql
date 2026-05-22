-- Seed: demo flights and seat maps (run after 001_initial_schema.sql)
-- Does not create Auth users — create test account in Supabase Dashboard first.

-- ---------------------------------------------------------------------------
-- Flights — 8 flights across 4 routes (2 per route)
-- ---------------------------------------------------------------------------
insert into public.flights (
  flight_no,
  origin,
  destination,
  departs_at,
  arrives_at,
  aircraft_type,
  status,
  base_price
)
values
  ('FM-101', 'DEL', 'BOM', now() + interval '2 days 6 hours', now() + interval '2 days 8 hours', 'A320', 'scheduled', 4500.00),
  ('FM-102', 'DEL', 'BOM', now() + interval '3 days 9 hours', now() + interval '3 days 11 hours', 'A320', 'scheduled', 5200.00),
  ('FM-201', 'BOM', 'DEL', now() + interval '2 days 12 hours', now() + interval '2 days 14 hours', 'B737', 'scheduled', 4800.00),
  ('FM-202', 'BOM', 'DEL', now() + interval '4 days 7 hours', now() + interval '4 days 9 hours', 'B737', 'scheduled', 5100.00),
  ('FM-301', 'DEL', 'BLR', now() + interval '2 days 15 hours', now() + interval '2 days 17 hours', 'A320', 'scheduled', 3900.00),
  ('FM-302', 'DEL', 'BLR', now() + interval '5 days 6 hours', now() + interval '5 days 8 hours', 'A320', 'scheduled', 4200.00),
  ('FM-401', 'BLR', 'HYD', now() + interval '3 days 4 hours', now() + interval '3 days 5 hours', 'ATR-72', 'scheduled', 2800.00),
  ('FM-402', 'BLR', 'HYD', now() + interval '6 days 10 hours', now() + interval '6 days 11 hours', 'ATR-72', 'scheduled', 3100.00);

-- ---------------------------------------------------------------------------
-- Seat maps — economy (1-18, A-F), business (19-21, A-D), first (22-23, A-B)
-- 124 seats per flight × 8 flights
-- ---------------------------------------------------------------------------
do $$
declare
  flight_record record;
  row_num integer;
  col_letter text;
  seat_class text;
  extra numeric;
  cabin_cols text[];
begin
  for flight_record in select id from public.flights loop
    for row_num in 1..23 loop
      if row_num <= 18 then
        seat_class := 'economy';
        extra := 0;
        cabin_cols := array['A', 'B', 'C', 'D', 'E', 'F'];
      elsif row_num <= 21 then
        seat_class := 'business';
        extra := 1500;
        cabin_cols := array['A', 'B', 'C', 'D'];
      else
        seat_class := 'first';
        extra := 5000;
        cabin_cols := array['A', 'B'];
      end if;

      foreach col_letter in array cabin_cols loop
        insert into public.seats (
          flight_id,
          seat_number,
          class,
          is_available,
          extra_fee
        )
        values (
          flight_record.id,
          row_num::text || col_letter,
          seat_class,
          true,
          extra
        );
      end loop;
    end loop;
  end loop;
end;
$$;

-- Sample occupied seats on FM-101 for demo visuals
update public.seats s
set is_available = false
from public.flights f
where s.flight_id = f.id
  and f.flight_no = 'FM-101'
  and s.seat_number in ('5A', '5B', '12C', '19A');
