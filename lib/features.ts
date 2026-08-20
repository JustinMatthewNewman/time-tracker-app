// Type-only: erased before Node's ESM resolver ever sees it. A value import
// would need an explicit "./userTypes.ts" to resolve at runtime (this file is
// loaded directly by scripts/seed-stress-test.mjs), which in turn needs
// tsconfig's allowImportingTsExtensions. Keeping it type-only avoids both.
import type { UserTypeName } from "./userTypes";

// Single source of truth for the application features modelled by the Feature
// table (dataconnect/schema/schema.gql) and granted to tiers through the
// UserTypeFeature xref. Companion to lib/userTypes.ts.
//
// As with the tiers, SDL has no module system, so these names are repeated in
// dataconnect/seed_data.gql's SeedFeatures mutation. Everything in
// TypeScript/Node should import from here rather than writing the string.
//
// SECURITY: holding a feature is a *rendering* signal on the client. The value
// arrives from GetMyUser, which the browser can trivially spoof, so it must
// never be the only thing standing between a user and privileged data. Every
// feature-gated capability needs the same check re-run server-side against the
// caller's verified ID token — see assertHasFeature() in lib/featureAccess.ts.

// Renaming a value here is a DATA migration, not just a code change: Feature
// is keyed on `name`, and UserTypeFeature's foreign key references it, so the
// old row and its grants have to be replaced rather than edited in place.
// See the "renaming a feature" note on SeedFeatures in seed_data.gql.
export const FEATURE_NAMES = ["AdminPage", "Dashboard", "UserTypeControl", "AdminDashboard"] as const;

export type FeatureName = (typeof FEATURE_NAMES)[number];

export function isFeatureName(value: string): value is FeatureName {
  return (FEATURE_NAMES as readonly string[]).includes(value);
}

/**
 * What each feature is, and which tiers hold it in a freshly seeded
 * environment. Consumed by scripts/seed-stress-test.mjs; mirrored by hand in
 * dataconnect/seed_data.gql's SeedFeatures, which can't import.
 *
 * This is the *initial* grant matrix, not live state — once an environment is
 * running, grants are edited in the UserTypeFeature table (eventually from the
 * admin UI), and this no longer describes it.
 *
 * Typed as a total Record, so adding a name to FEATURE_NAMES without defining
 * it here is a compile error rather than a feature that silently seeds nowhere.
 */
export const FEATURE_DEFINITIONS: Record<
  FeatureName,
  { description: string; defaultTiers: readonly UserTypeName[] }
> = {
  AdminPage: {
    description: "Access to the admin page and its APIs.",
    defaultTiers: ["Admin"],
  },
  AdminDashboard: {
    // Distinct from AdminPage: that one opens the admin page at all, this one
    // adds the Teams tab inside it. Separate grants so a tier can be given the
    // team view without the user-management surface, or vice versa.
    description: "View teams and their members on the admin page.",
    defaultTiers: ["Admin"],
  },
  UserTypeControl: {
    // Separate from AdminPage on purpose: reading who exists and changing what
    // they can do are different privileges, and this one is a privilege-
    // escalation vector (whoever holds it can promote anyone, themselves
    // included, to any tier). Keeping it its own grant means a future
    // read-only auditor tier can hold AdminPage without it.
    description: "Change which tier a user belongs to.",
    defaultTiers: ["Admin"],
  },
  Dashboard: {
    // Every current tier: this gated an already-shipped page, so the starting
    // point has to be "nobody loses what they had". See seed_data.gql.
    //
    // Spelled out rather than derived from USER_TYPE_NAMES on purpose — a tier
    // added later should be an explicit decision about what it can reach, not
    // something that silently inherits every existing grant. UserTypeName keeps
    // typos a compile error.
    description: "Access to the dashboard tab and its reports.",
    defaultTiers: ["Admin", "Guest", "Regular", "Elevated", "Premium"],
  },
};
