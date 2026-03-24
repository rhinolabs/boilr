/**
 * Deeply merges two configuration objects.
 *
 * - Properties in `overrides` replace or extend those in `defaults`.
 * - Nested objects are merged recursively.
 * - `null` and `undefined` values in `overrides` are ignored.
 *
 * @param defaults - The base configuration.
 * @param overrides - Configuration values to merge on top of defaults.
 * @returns A new merged configuration object.
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

// biome-ignore lint/suspicious/noExplicitAny: required for generic config merging
export function mergeConfigRecursively<T extends Record<string, any>, U extends Partial<Record<string, any>>>(
  defaults: T,
  overrides: U,
): T {
  const merged: T = { ...defaults };

  for (const key in overrides) {
    if (!Object.hasOwn(overrides, key)) continue;

    const value = overrides[key];
    // NOTE: The value is overwritten only if it is undefined.
    // Explicit falsy values like false or null should be allowed.
    if (value === undefined) continue;

    const existing = merged[key];
    if (existing === undefined) {
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

// biome-ignore lint/suspicious/noExplicitAny: required for generic config merging
function isObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === "[object Object]";
}
