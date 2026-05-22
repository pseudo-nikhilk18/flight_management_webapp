-- Reschedule booking atomically: same route, seat swap, fee tracking

create or replace function public.reschedule_booking(
  p_booking_id uuid,
  p_new_flight_id uuid,
  p_new_seat_id uuid
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings;
  v_old_flight public.flights;
  v_new_flight public.flights;
  v_new_seat public.seats;
  v_new_total numeric(10, 2);
  v_fee_charged numeric(10, 2);
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
    raise exception 'Not authorized to reschedule this booking';
  end if;

  if v_booking.status not in ('confirmed', 'rescheduled') then
    raise exception 'Only active bookings can be rescheduled';
  end if;

  if public.departure_within_two_hours(v_booking.flight_id) then
    raise exception 'Reschedules within 2 hours of departure are not allowed';
  end if;

  select *
  into v_old_flight
  from public.flights
  where id = v_booking.flight_id;

  select *
  into v_new_flight
  from public.flights
  where id = p_new_flight_id;

  if not found then
    raise exception 'New flight not found';
  end if;

  if v_new_flight.status <> 'scheduled' then
    raise exception 'Selected flight is not available';
  end if;

  if v_old_flight.origin <> v_new_flight.origin
    or v_old_flight.destination <> v_new_flight.destination then
    raise exception 'New flight must be on the same route';
  end if;

  if v_booking.flight_id = p_new_flight_id then
    raise exception 'Select a different flight to reschedule';
  end if;

  select *
  into v_new_seat
  from public.seats
  where id = p_new_seat_id
  for update;

  if not found then
    raise exception 'Seat not found';
  end if;

  if v_new_seat.flight_id <> p_new_flight_id then
    raise exception 'Seat does not belong to the selected flight';
  end if;

  if not v_new_seat.is_available then
    raise exception 'Selected seat is no longer available';
  end if;

  v_new_total := v_new_flight.base_price + v_new_seat.extra_fee;
  v_fee_charged := greatest(0, v_new_total - v_booking.total_price);

  if v_booking.seat_id is not null then
    update public.seats
    set is_available = true
    where id = v_booking.seat_id;
  end if;

  update public.seats
  set is_available = false
  where id = p_new_seat_id;

  perform set_config('app.bypass_seat_guard', 'on', true);

  update public.bookings
  set
    flight_id = p_new_flight_id,
    seat_id = p_new_seat_id,
    total_price = v_new_total,
    status = 'rescheduled'
  where id = p_booking_id
  returning * into v_booking;

  insert into public.reschedules (
    booking_id,
    old_flight_id,
    new_flight_id,
    fee_charged
  )
  values (
    p_booking_id,
    v_old_flight.id,
    p_new_flight_id,
    v_fee_charged
  );

  return v_booking;
end;
$$;

grant execute on function public.reschedule_booking(uuid, uuid, uuid) to authenticated;
