/**
 * Deeply merges two configuration objects.
 *
 * - Properties in `overrides` replace or extend those in `defaults`.
 * - Nested objects are merged recursively.
 * - `null` and `undefined` values in `overrides` are ignored.
 *
 * @example
 * const defaults = {
 *   openapi: "3.0.0",
 *   info: { title: "My API", version: "1.0.0" }
 * };
 *
 * const overrides = {
 *   info: { title: "Custom API" }
 * };
 *
 * mergeConfigRecursively(defaults, overrides);
 * // Result:
 * // {
 * //   openapi: "3.0.0",
 * //   info: { title: "Custom API", version: "1.0.0" }
 * // }
 */

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function mergeConfigRecursively<T extends Record<string, any>>(defaults: T, overrides: Partial<T>): T {
  const merged: T = { ...defaults };

  for (const key in overrides) {
    const value = overrides[key];
    if (!value) continue;

    const existing = merged[key];
    if (!existing) {
      merged[key] = value;
      continue;
    }

    if (isObject(existing) && isObject(value)) {
      merged[key] = mergeConfigRecursively(existing, value);
      continue;
    }

    merged[key] = value;
  }

  return merged;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function isObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === "[object Object]";
}
