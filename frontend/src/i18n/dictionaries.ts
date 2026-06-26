import "server-only";

import type { Locale } from "./config";

// Each dictionary is loaded only on the server, so message size never affects
// the client bundle. `az` is the source of truth for the Dictionary shape.
const dictionaries = {
  az: () => import("./dictionaries/az.json").then((m) => m.default),
  ru: () => import("./dictionaries/ru.json").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["az"]>>;

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
