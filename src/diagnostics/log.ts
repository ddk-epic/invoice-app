export type Level = "warn" | "error";

export function log(
  level: Level,
  message: string,
  fields?: Record<string, unknown>
): void {
  if (fields) console[level](message, fields);
  else console[level](message);
}
