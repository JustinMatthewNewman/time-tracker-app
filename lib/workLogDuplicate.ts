/**
 * Moving a time entry from one work log's date onto another's.
 *
 * Pulled out of hooks/useWorkLogs.ts' duplicateWorkLog so the date arithmetic
 * — the only part that can be wrong in a way nobody notices until a clock
 * change — is testable without a Data Connect client.
 */

/**
 * Rebuilds `entryIso` on the target day, keeping its local wall-clock time.
 *
 * Deliberately NOT `entry + (target - source)` in milliseconds. Across a DST
 * boundary the two dates are 23 or 25 hours apart, so a millisecond delta
 * moves every entry an hour: duplicating Friday's 8am–4pm onto the Monday
 * after a spring-forward would write 9am–5pm. Reconstructing from local
 * components keeps 8am at 8am, which is what "copy this day" means.
 *
 * The day *offset* is still computed from the two midnights, so an entry that
 * ran past midnight on the source day (and therefore sat on the following
 * calendar day) stays one day ahead on the target too.
 */
export function shiftEntryToDate(
  entryIso: string,
  sourceWorkLogDateIso: string,
  targetWorkLogDateIso: string
): string {
  const at = new Date(entryIso);
  const source = new Date(sourceWorkLogDateIso);
  const target = new Date(targetWorkLogDateIso);

  // Floored, so an entry earlier in the day than the work log's own midnight
  // (which shouldn't happen, but would otherwise round toward zero and land a
  // day late) keeps a negative offset.
  const dayOffset = Math.floor((at.getTime() - source.getTime()) / 86_400_000);

  return new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate() + dayOffset,
    at.getHours(),
    at.getMinutes(),
    at.getSeconds(),
    at.getMilliseconds()
  ).toISOString();
}
