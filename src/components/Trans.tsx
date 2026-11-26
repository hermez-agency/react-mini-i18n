import { ReactNode, useSyncExternalStore } from "react"
import useTranslationContext from "@/provider/useTranslationContext"
import translate, {
  getTranslations,
  subscribeTranslations,
} from "@/translate"
import { escapeParams } from "@/escapeHtml"

export interface TransPropsInterface {
  params?: Record<string, any>
  children?: ReactNode | string
  className?: string
}

export function Trans({ children, params, className }: TransPropsInterface) {
  const translateContext = useTranslationContext()
  // Re-render when the dictionary singleton changes (setTranslation, addTrans).
  useSyncExternalStore(subscribeTranslations, getTranslations, getTranslations)
  if (!children) return

  const trans = translateContext ? translateContext.translate : translate

  // Params are escaped before being injected into markup: only the dictionary
  // may bring HTML, a value coming from a user is always rendered as text.
  const htmlContent = trans(
    children as string,
    params ? escapeParams(params) : params
  )
  if (isValidHtml(htmlContent)) {
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  }
  if (className) {
    return <span className={className}>{trans(children as string, params)}</span>
  }

  return <>{trans(children as string, params)}</>
}

const isValidHtml = (str: string): boolean => {
  const regex = /^<([a-z]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)$/i
  if (!regex.test(str)) {
    return false
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(str, "text/html")
  return doc.body.firstChild !== null
}
