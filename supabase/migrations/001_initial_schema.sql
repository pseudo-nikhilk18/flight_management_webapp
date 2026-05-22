-- Flight Management System — initial schema, RLS, and core RPCs
-- Apply via Supabase SQL Editor or: supabase db push (if using CLI)

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.flights (
  id uuid primary key default gen_random_uuid(),
  flight_no text not null unique,
  origin text not null,
  destination text not null,
  departs_at timestamptz not null,
  arrives_at timestamptz not null,
  aircraft_type text not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'delayed', 'cancelled')),
  base_price numeric(10, 2) not null check (base_price >= 0),
  created_at timestamptz not null default now(),
  constraint flights_route_time_valid check (arrives_at > departs_at)
);

create table public.seats (
  id uuid primary key default gen_random_uuid(),
  flight_id uuid not null references public.flights (id) on delete cascade,
  seat_number text not null,
  class text not null check (class in ('economy', 'business', 'first')),
  is_available boolean not null default true,
  extra_fee numeric(10, 2) not null default 0 check (extra_fee >= 0),
  created_at timestamptz not null default now(),
  unique (flight_id, seat_number)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  flight_id uuid not null references public.flights (id) on delete restrict,
  seat_id uuid references public.seats (id) on delete restrict,
  status text not null default 'confirmed'
    check (status in ('confirmed', 'rescheduled', 'cancelled')),
  booked_at timestamptz not null default now(),
  total_price numeric(10, 2) not null check (total_price >= 0),
  pnr_code text not null unique,
  created_at timestamptz not null default now()
);

create table public.passengers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  full_name text not null,
  passport_no text not null,
  nationality text not null,
  dob date not null,
  created_at timestamptz not null default now()
);

create table public.reschedules (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  old_flight_id uuid not null references public.flights (id) on delete restrict,
  new_flight_id uuid not null references public.flights (id) on delete restrict,
  fee_charged numeric(10, 2) not null default 0 check (fee_charged >= 0),
  requested_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index flights_route_departure_idx
  on public.flights (origin, destination, departs_at);

create index flights_status_idx on public.flights (status);

create index seats_flight_id_idx on public.seats (flight_id);

create index seats_flight_availability_idx
  on public.seats (flight_id, is_available);

create index bookings_user_id_idx on public.bookings (user_id);

create index bookings_flight_id_idx on public.bookings (flight_id);

create index passengers_booking_id_idx on public.passengers (booking_id);

create index reschedules_booking_id_idx on public.reschedules (booking_id);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.generate_pnr_code()
returns text
language plpgsql
as $$
declare
  candidate text;
begin
  loop
    candidate := upper(
      substr(
        encode(gen_random_bytes(6), 'base64'),
        1,
        6
      )
    );
    candidate := regexp_replace(candidate, '[^A-Z0-9]', 'X', 'g');
    candidate := substr(candidate, 1, 6);

    exit when length(candidate) = 6
      and not exists (
        select 1 from public.bookings b where b.pnr_code = candidate
      );
  end loop;

  return candidate;
end;
$$;

create or replace function public.set_booking_pnr()
returns trigger
language plpgsql
as $$
begin
  if new.pnr_code is null or btrim(new.pnr_code) = '' then
    new.pnr_code := public.generate_pnr_code();
  end if;
  return new;
end;
$$;

create trigger bookings_set_pnr
before insert on public.bookings
for each row
execute function public.set_booking_pnr();

create or replace function public.departure_within_two_hours(p_flight_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.flights f
    where f.id = p_flight_id
      and f.departs_at <= now() + interval '2 hours'
  );
$$;

-- ---------------------------------------------------------------------------
-- RPC: reserve seat (concurrency-safe)
-- ---------------------------------------------------------------------------
create or replace function public.reserve_seat(
  p_seat_id uuid,
  p_booking_id uuid
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings;
  v_seat public.seats;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select *
  into v_booking
  from public.bookings
  where id = p_booking_id
  for update;

  if not found then
    raise exception 'Booking not found';
  end if;

  if v_booking.user_id <> auth.uid() then
    raise exception 'Not authorized to modify this booking';
  end if;

  if v_booking.status <> 'confirmed' then
    raise exception 'Only confirmed bookings can reserve a seat';
  end if;

  if v_booking.seat_id is not null then
    raise exception 'Booking already has a seat assigned';
  end if;

  select *
  into v_seat
  from public.seats
  where id = p_seat_id
  for update;

  if not found then
    raise exception 'Seat not found';
  end if;

  if v_seat.flight_id <> v_booking.flight_id then
    raise exception 'Seat does not belong to the booked flight';
  end if;

  if not v_seat.is_available then
    raise exception 'Seat is no longer available';
  end if;

  update public.seats
  set is_available = false
  where id = p_seat_id;

  perform set_config('app.bypass_seat_guard', 'on', true);

  update public.bookings
  set seat_id = p_seat_id
  where id = p_booking_id
  returning * into v_booking;

  return v_booking;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: cancel booking (atomic + 2-hour rule)
-- ---------------------------------------------------------------------------
create or replace function public.cancel_booking(p_booking_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select *
  into v_booking
  from public.bookings
  where id = p_booking_id
  for update;

  if not found then
    raise exception 'Booking not found';
  end if;

  if v_booking.user_id <> auth.uid() then
    raise exception 'Not authorized to cancel this booking';
  end if;

  if v_booking.status = 'cancelled' then
    raise exception 'Booking is already cancelled';
  end if;

  if public.departure_within_two_hours(v_booking.flight_id) then
    raise exception 'Cancellations within 2 hours of departure are not allowed';
  end if;

  if v_booking.seat_id is not null then
    update public.seats
    set is_available = true
    where id = v_booking.seat_id;
  end if;

  perform set_config('app.bypass_cancel_guard', 'on', true);

  update public.bookings
  set
    status = 'cancelled',
    seat_id = null
  where id = p_booking_id
  returning * into v_booking;

  return v_booking;
end;
$$;

-- Block direct status changes that bypass cancel_booking RPC
create or replace function public.prevent_direct_booking_cancel()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'cancelled'
    and old.status <> 'cancelled'
    and current_setting('app.bypass_cancel_guard', true) <> 'on' then
    raise exception 'Use cancel_booking() to cancel a booking';
  end if;

  return new;
end;
$$;

create trigger bookings_prevent_direct_cancel
before update of status on public.bookings
for each row
execute function public.prevent_direct_booking_cancel();

create or replace function public.prevent_direct_seat_assignment()
returns trigger
language plpgsql
as $$
begin
  if new.seat_id is distinct from old.seat_id
    and new.seat_id is not null
    and current_setting('app.bypass_seat_guard', true) <> 'on' then
    raise exception 'Use reserve_seat() to assign a seat';
  end if;

  return new;
end;
$$;

create trigger bookings_prevent_direct_seat_assignment
before update of seat_id on public.bookings
for each row
execute function public.prevent_direct_seat_assignment();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.flights enable row level security;
alter table public.seats enable row level security;
alter table public.bookings enable row level security;
alter table public.passengers enable row level security;
alter table public.reschedules enable row level security;

-- Flights & seats: readable by everyone (search before login)
create policy "flights_select_public"
  on public.flights
  for select
  to anon, authenticated
  using (true);

create policy "seats_select_public"
  on public.seats
  for select
  to anon, authenticated
  using (true);

-- Bookings: owner only
create policy "bookings_select_own"
  on public.bookings
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "bookings_insert_own"
  on public.bookings
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and status = 'confirmed'
    and not public.departure_within_two_hours(flight_id)
  );

create policy "bookings_update_own"
  on public.bookings
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Passengers: only for own bookings
create policy "passengers_select_own"
  on public.passengers
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.bookings b
      where b.id = booking_id
        and b.user_id = auth.uid()
    )
  );

create policy "passengers_insert_own"
  on public.passengers
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.bookings b
      where b.id = booking_id
        and b.user_id = auth.uid()
    )
  );

-- Reschedules: only for own bookings (writes via future RPC / app)
create policy "reschedules_select_own"
  on public.reschedules
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.bookings b
      where b.id = booking_id
        and b.user_id = auth.uid()
    )
  );

create policy "reschedules_insert_own"
  on public.reschedules
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.bookings b
      where b.id = booking_id
        and b.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.flights to anon, authenticated;
grant select on public.seats to anon, authenticated;

grant select, insert, update on public.bookings to authenticated;
grant select, insert on public.passengers to authenticated;
grant select, insert on public.reschedules to authenticated;

grant execute on function public.reserve_seat(uuid, uuid) to authenticated;
grant execute on function public.cancel_booking(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime (Task 02)
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.seats;
