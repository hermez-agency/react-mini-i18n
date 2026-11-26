import { render, screen, waitFor } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { TranslationProvider } from "@/provider/TranslationProvider"
import { Trans } from "@/components/Trans"
import { setTranslation } from "@/translate"

describe("TranslationProvider", () => {
  // `translate` reads a module-level dictionary that outlives a render: a
  // test seeding it would otherwise decide what the next one sees.
  beforeEach(() => setTranslation({}))

  it("renders its children on a server, where effects never run", () => {
    // The regression this guards: the provider used to withhold everything
    // until an effect resolved, so a server render produced an empty page and
    // nothing could read the markup.
    const html = renderToStaticMarkup(
      <TranslationProvider initialTranslations={{ hello: "Bonjour" }}>
        <Trans>hello</Trans>
      </TranslationProvider>
    )

    expect(html).toContain("Bonjour")
  })

  it("never withholds its children while the dictionary loads", async () => {
    const { container } = render(
      <TranslationProvider provider={() => new Promise(() => {})}>
        <Trans>hello</Trans>
      </TranslationProvider>
    )

    // The promise never settles: whatever is on screen is what a first render
    // produces, and it must not be nothing.
    expect(container.textContent).toBe("hello")
  })

  it("applies an asynchronous dictionary once it arrives", async () => {
    render(
      <TranslationProvider provider={async () => ({ hello: "Bonjour" })}>
        <Trans>hello</Trans>
      </TranslationProvider>
    )

    await waitFor(() => expect(screen.getByText("Bonjour")).toBeDefined())
  })

  it("lets an asynchronous dictionary replace the initial one", async () => {
    render(
      <TranslationProvider
        initialTranslations={{ hello: "Salut" }}
        provider={async () => ({ hello: "Bonjour" })}
      >
        <Trans>hello</Trans>
      </TranslationProvider>
    )

    expect(screen.getByText("Salut")).toBeDefined()
    await waitFor(() => expect(screen.getByText("Bonjour")).toBeDefined())
  })

  it("shows the fallback instead of the children while the dictionary loads", async () => {
    const { container } = render(
      <TranslationProvider
        provider={() => new Promise(() => {})}
        fallback={<p>Chargement…</p>}
      >
        <Trans>hello</Trans>
      </TranslationProvider>
    )

    expect(container.textContent).toBe("Chargement…")
  })

  it("replaces the fallback with the children once the dictionary arrives", async () => {
    render(
      <TranslationProvider
        provider={async () => ({ hello: "Bonjour" })}
        fallback={<p>Chargement…</p>}
      >
        <Trans>hello</Trans>
      </TranslationProvider>
    )

    expect(screen.getByText("Chargement…")).toBeDefined()
    await waitFor(() => expect(screen.getByText("Bonjour")).toBeDefined())
    expect(screen.queryByText("Chargement…")).toBeNull()
  })

  it("renders the children without waiting when the dictionary is known up front", () => {
    const { container } = render(
      <TranslationProvider
        initialTranslations={{ hello: "Bonjour" }}
        provider={() => new Promise(() => {})}
        fallback={<p>Chargement…</p>}
      >
        <Trans>hello</Trans>
      </TranslationProvider>
    )

    expect(container.textContent).toBe("Bonjour")
  })

  it("calls onError and renders the children with keys when the dictionary fails", async () => {
    const error = new Error("network down")
    const onError = vi.fn()

    render(
      <TranslationProvider
        provider={() => Promise.reject(error)}
        fallback={<p>Chargement…</p>}
        onError={onError}
      >
        <Trans>hello</Trans>
      </TranslationProvider>
    )

    await waitFor(() => expect(screen.getByText("hello")).toBeDefined())
    expect(screen.queryByText("Chargement…")).toBeNull()
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(error)
  })

  it("renders the children when the dictionary fails without an onError", async () => {
    render(
      <TranslationProvider provider={() => Promise.reject(new Error("boom"))}>
        <Trans>hello</Trans>
      </TranslationProvider>
    )

    await waitFor(() => expect(screen.getByText("hello")).toBeDefined())
  })

  it("renders the fallback on a server, where the dictionary never loads", () => {
    const html = renderToStaticMarkup(
      <TranslationProvider
        provider={async () => ({ hello: "Bonjour" })}
        fallback={<p>Chargement…</p>}
      >
        <Trans>hello</Trans>
      </TranslationProvider>
    )

    expect(html).toContain("Chargement…")
    expect(html).not.toContain("hello")
  })
})
