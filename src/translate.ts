import { translateWithParams } from "@/translateWithParams"

export type TranslationsBagInterface = Record<string, any>

let translations = {} as TranslationsBagInterface

const listeners = new Set<() => void>()

export const getTranslations = () => translations

/**
 * Subscribes to dictionary changes (`useSyncExternalStore` compatible).
 * Returns the function that unsubscribes.
 */
export function subscribeTranslations(listener: () => void): () => void {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

const emitChange = () => listeners.forEach((listener) => listener())

export default function translate(
  key: string,
  params?: TranslationsBagInterface
): string {
  let value = translations[key] ? translations[key] : key

  if (params) {
    value = translateWithParams(value, params)
  }

  return value
}

export function setTranslation(newTranslation: TranslationsBagInterface) {
  if (newTranslation === translations) return

  translations = newTranslation
  emitChange()
}

export function addTrans(key: string, value: string) {
  if (translations[key] === value) return

  // A new object, so the snapshot read by subscribers changes identity.
  translations = { ...translations, [key]: value }
  emitChange()
}
