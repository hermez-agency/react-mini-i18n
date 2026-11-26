import { TranslationsBagInterface } from "@/translate"

const entities: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => entities[char])
}

/**
 * Escapes every parameter value, so that interpolating them into an HTML
 * translation can only add text, never markup. Falsy values are kept as they
 * are: `translateWithParams` leaves their placeholder untouched.
 */
export function escapeParams(
  params: TranslationsBagInterface
): TranslationsBagInterface {
  const escaped: TranslationsBagInterface = {}
  for (const key of Object.keys(params)) {
    const value = params[key]
    escaped[key] = value ? escapeHtml(String(value)) : value
  }

  return escaped
}
