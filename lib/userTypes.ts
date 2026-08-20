// Single source of truth for the account tiers modelled by the UserType table
// (dataconnect/schema/schema.gql). Feature gating should switch on these
// constants rather than bare string literals, so a renamed or added tier
// surfaces as a type error instead of a silently-never-true comparison.
//
// The GraphQL side can't import from here — SDL has no module system — so the
// tier names are necessarily repeated in dataconnect/seed_data.gql's
// SeedUserTypes mutation and in User.userTypeName's @default. Those two spots
// and this file must be kept in step; everything in TypeScript/Node should
// import from here instead of adding a fourth copy.

export const USER_TYPE_NAMES = ["Admin", "Guest", "Regular", "Elevated", "Premium"] as const;

export type UserTypeName = (typeof USER_TYPE_NAMES)[number];

/** Tier assigned to brand-new accounts, and backfilled onto pre-existing rows. */
export const DEFAULT_USER_TYPE: UserTypeName = "Regular";

export function isUserTypeName(value: string): value is UserTypeName {
  return (USER_TYPE_NAMES as readonly string[]).includes(value);
}
