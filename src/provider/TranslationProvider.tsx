import { ReactNode, useEffect, useRef, useState } from "react"
import translate, {
  setTranslation,
  TranslationsBagInterface,
} from "@/translate"
import { TranslationContext } from "@/provider/TranslationContext"

interface ElemPropsInterface {
  children: ReactNode
  /**
   * Loads the dictionary after mount, for translations that live behind an
   * API.
   */
  provider?: () => Promise<TranslationsBagInterface>
  /**
   * Dictionary available from the very first render.
   *
   * Required to render on a server: `provider` resolves inside an effect,
   * which never runs there, so without this the first render has nothing to
   * translate with. Pass it whenever the dictionary is known up front — a
   * bundled file, or a payload the server already holds.
   */
  initialTranslations?: TranslationsBagInterface
  /**
   * Rendered in place of the children while `provider` is loading.
   *
   * Without it, the children render straight away and show keys until the
   * dictionary arrives. Pass it when keys on screen would be worse than a
   * loading state.
   */
  fallback?: ReactNode
  /**
   * Called with the error when `provider` rejects. The children render anyway,
   * with keys standing in for the translations.
   */
  onError?: (error: unknown) => void
}

export const TranslationProvider = ({
  children,
  provider,
  initialTranslations,
  fallback,
  onError,
}: ElemPropsInterface) => {
  const [translations, setTranslations] =
    useState<TranslationsBagInterface | null>(() => {
      // `translate` is also callable outside the provider, from the module
      // singleton: seeding it here keeps both paths in agreement from the
      // first render rather than only once `provider` resolves.
      if (initialTranslations) setTranslation(initialTranslations)

      return initialTranslations ?? null
    })

  const hasFetched = useRef(false)

  const updateTranslations = () => {
    if (!provider) return
    provider()
      .then((data) => {
        setTranslation(data)
        setTranslations(data)
      })
      .catch((error: unknown) => {
        // Leave the loading state before reporting, so that a throwing
        // `onError` cannot keep the fallback on screen.
        setTranslations({})
        onError?.(error)
      })
  }

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    updateTranslations()
  }, [provider])

  // Render straight away, with keys standing in for their translations until
  // the dictionary lands. Holding the tree back instead would hide the whole
  // application from a server render, and from anything reading its output.
  // The exception is an explicit `fallback`, shown only while `provider` loads.
  const isLoading = provider !== undefined && translations === null

  return (
    <TranslationContext.Provider
      value={{ translations: translations ?? {}, updateTranslations, translate }}
    >
      {isLoading && fallback !== undefined ? fallback : children}
    </TranslationContext.Provider>
  )
}
