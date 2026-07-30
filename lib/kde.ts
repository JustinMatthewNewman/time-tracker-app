// Hand-rolled kernel density estimation for the activity ridgeline chart —
// small pure-function math, matching this repo's existing convention
// (lib/weekBuckets.ts, lib/timeTotals.ts) of hand-written utilities over a
// dependency for a ~10-line formula.

import { mean } from "d3-array";

export function kernelEpanechnikov(bandwidth: number): (x: number) => number {
  return (x: number) => {
    const u = x / bandwidth;
    return Math.abs(u) <= 1 ? (0.75 * (1 - u * u)) / bandwidth : 0;
  };
}

export function kde(
  kernel: (x: number) => number,
  thresholds: number[],
  values: number[]
): [number, number][] {
  return thresholds.map((t) => [t, mean(values, (v) => kernel(t - v)) ?? 0]);
}
