# Supabase Workspace

Database assets for the Flight Management assignment.

## Layout

| Path | Purpose |
|------|---------|
| `migrations/001_initial_schema.sql` | Tables, indexes, RLS, PNR trigger, `reserve_seat`, `cancel_booking`, Realtime |
| `seed/seed.sql` | 8 demo flights, full seat maps per flight |

## Apply migrations (Dashboard)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **SQL Editor** → **New query**.
3. Paste the full contents of `migrations/001_initial_schema.sql` → **Run**.
4. Confirm success (no errors in the results panel).

## Apply seed data

1. New SQL query in the editor.
2. Paste `seed/seed.sql` → **Run**.
3. Verify in **Table Editor**: `flights` should have 8 rows; each flight should have 124 seats.

## Test user (Auth)

Seed SQL does **not** create Auth users (Supabase manages `auth.users` separately).

1. Dashboard → **Authentication** → **Users** → **Add user**.
2. Demo account (also documented in project README):
   - Email: `passenger@flightdemo.test`
   - Password: `passenger123`
3. Enable **Auto Confirm User** so email verification is not required locally.

## Verify RPCs (optional)

After signing in as the test user in the app (later), or using SQL as that user:

- `reserve_seat(seat_id, booking_id)` — locks seat, links booking
- `cancel_booking(booking_id)` — frees seat, sets `cancelled`, enforces 2-hour rule

## Realtime

Migration adds `seats` to `supabase_realtime`. In Dashboard → **Database** → **Replication**, confirm `seats` is enabled if live updates do not appear in Task 02.

## Notes

- `flights` and `seats` are readable by **anon** and **authenticated** (search before login).
- `bookings`, `passengers`, and `reschedules` are **owner-only** via RLS.
- Seat assignment and cancellation must go through RPCs (DB triggers block direct updates).
