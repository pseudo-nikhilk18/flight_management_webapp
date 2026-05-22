export const protectedRoutePrefixes = [
  "/bookings",
  "/book",
  "/confirmation",
] as const;

export function isProtectedPath(pathname: string) {
  return protectedRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
