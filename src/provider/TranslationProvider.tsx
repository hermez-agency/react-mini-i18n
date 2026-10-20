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
}

export const TranslationProvider = ({
  children,
  provider,
  initialTranslations,
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
      .catch(() => setTranslations({}))
  }

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    updateTranslations()
  }, [provider])

  // Render straight away, with keys standing in for their translations until
  // the dictionary lands. Holding the tree back instead would hide the whole
  // application from a server render, and from anything reading its output.
  return (
    <TranslationContext.Provider
      value={{ translations: translations ?? {}, updateTranslations, translate }}
    >
      {children}
    </TranslationContext.Provider>
  )
}
