// Offset-paginates a Data Connect list query defensively. The generated
// queries (see dataconnect/example/queries.gql) default `limit` to 500, but
// the server-enforced ceiling on that value is unverified — rather than
// trusting one large `limit:` call to return everything, this fetches capped
// pages and keeps going while a page comes back full, so it stays correct
// regardless of what the real ceiling turns out to be.
const PAGE_SIZE = 500;

export async function fetchAllPages<TVars extends object, TRow>(
  fetchPage: (vars: TVars & { limit: number; offset: number }) => Promise<TRow[]>,
  baseVars: TVars,
  pageSize = PAGE_SIZE
): Promise<TRow[]> {
  const all: TRow[] = [];
  let offset = 0;

  while (true) {
    const page = await fetchPage({ ...baseVars, limit: pageSize, offset });
    all.push(...page);
    if (page.length < pageSize) break;
    offset += pageSize;
  }

  return all;
}
