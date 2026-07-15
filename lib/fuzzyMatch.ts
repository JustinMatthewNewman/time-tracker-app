// VSCode-style subsequence fuzzy matching: every character of the query must
// appear in the target, in order, but not necessarily contiguously. Results
// are ranked by how "tight" and how early the match is, so "wl" matches
// "Work Log" tighter than it matches "Weekly report log", for example.

export interface FuzzyMatch {
  // Lower is better. Comparable across matches against the same query.
  score: number;
  // Index of every matched character in the target, for highlighting.
  indices: number[];
}

export function fuzzyMatch(query: string, target: string): FuzzyMatch | null {
  const q = query.trim().toLowerCase();
  if (!q) return { score: 0, indices: [] };

  const t = target.toLowerCase();
  const indices: number[] = [];
  let qi = 0;

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      indices.push(ti);
      qi++;
    }
  }

  if (qi < q.length) return null;

  const span = indices[indices.length - 1] - indices[0] + 1;
  // Tighter matches and earlier starts rank better; span dominates so an
  // exact contiguous substring always beats a scattered one.
  const score = span - q.length + indices[0] * 0.1;
  return { score, indices };
}

// Splits `text` into alternating unmatched/matched runs based on `indices`
// (as returned by fuzzyMatch), for rendering highlighted search results.
export function splitByMatch(text: string, indices: number[]): { text: string; matched: boolean }[] {
  if (indices.length === 0) return [{ text, matched: false }];

  const matchedSet = new Set(indices);
  const runs: { text: string; matched: boolean }[] = [];
  let current = "";
  let currentMatched = matchedSet.has(0);

  for (let i = 0; i < text.length; i++) {
    const isMatched = matchedSet.has(i);
    if (isMatched !== currentMatched && current) {
      runs.push({ text: current, matched: currentMatched });
      current = "";
    }
    currentMatched = isMatched;
    current += text[i];
  }
  if (current) runs.push({ text: current, matched: currentMatched });

  return runs;
}
