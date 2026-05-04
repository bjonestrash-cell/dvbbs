/**
 * Single-source toggle for the public-demo mode.
 *
 * When `true`:
 *   - The proxy passes through every request without checking session.
 *   - Layout and pages skip requireMember() so anon users see the full UI.
 *   - Header hides the user menu.
 *   - Read API routes (search, invoice signed URL) skip requireMember.
 *   - Server actions still call requireRole(), so writes return a redirect to
 *     /login. That keeps the database safe while the UI stays viewable.
 *
 * Flip back to `false` to re-enable magic-link auth and role gates everywhere.
 */
export const AUTH_DISABLED = true;
