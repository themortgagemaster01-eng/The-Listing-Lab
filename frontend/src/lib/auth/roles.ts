/**
 * The single "what kind of professional are you" question asked at sign-up
 * (see `components/auth/SignupForm.tsx`) — per Robert's explicit sign-up
 * spec: name/email/password + this one role question only, no brokerage,
 * no MLS ID, no phone number (those belong in Brand Center later, once a
 * user actually has an account to attach them to).
 *
 * The stored `value` lives in `auth.users.user_metadata.role` in Supabase —
 * see `src/lib/supabase/session.ts`'s `getAuthUser()`, which reads it back
 * out and turns it into the `roleLabel` shown next to the user's name in
 * `components/layout/UserMenu.tsx`.
 */
export const ROLE_OPTIONS = [
  { value: "realtor", label: "Realtor" },
  { value: "loan_officer", label: "Loan Officer" },
  { value: "team", label: "Team" },
  { value: "brokerage", label: "Brokerage" },
] as const;

export type RoleValue = (typeof ROLE_OPTIONS)[number]["value"];

/** Looks up the display label for a stored role value; "" if unknown/unset. */
export function roleLabel(value?: string | null): string {
  return ROLE_OPTIONS.find((option) => option.value === value)?.label ?? "";
}
