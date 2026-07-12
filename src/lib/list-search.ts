export function filterMatches<T>(
  items: T[],
  matches: (item: T, query: string) => boolean,
  query: string
): T[] {
  if (query === "") return items;
  return items.filter((item) => matches(item, query));
}
