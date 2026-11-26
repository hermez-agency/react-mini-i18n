import { Profiler } from "react"
import { beforeEach, describe, expect, it } from "vitest"
import { act, render, screen } from "@testing-library/react"
import { Trans } from "@/components/Trans"
import { addTrans, setTranslation } from "@/translate"
import { TranslationContext } from "@/provider/TranslationContext"

describe("Trans", () => {
  beforeEach(() => {
    setTranslation({})
  })

  it("renders the translation of its content", () => {
    setTranslation({ hello: "Hello" })
    render(<Trans>hello</Trans>)
    expect(screen.getByText("Hello")).toBeInTheDocument()
  })

  it("renders the original text when no translation exists", () => {
    render(<Trans>Raw text</Trans>)
    expect(screen.getByText("Raw text")).toBeInTheDocument()
  })

  it("interpolates parameters", () => {
    setTranslation({ greeting: "Hello {{name}}" })
    render(<Trans params={{ name: "Sam" }}>greeting</Trans>)
    expect(screen.getByText("Hello Sam")).toBeInTheDocument()
  })

  it("wraps the text in a span when a class name is given", () => {
    const { container } = render(<Trans className="heading">Text</Trans>)
    expect(container.querySelector("span.heading")).not.toBeNull()
  })

  it("renders nothing without content", () => {
    const { container } = render(<Trans />)
    expect(container).toBeEmptyDOMElement()
  })

  it("renders a translation that is an HTML fragment as markup", () => {
    setTranslation({ cgu: "<b>Terms</b>" })
    const { container } = render(<Trans>cgu</Trans>)
    expect(container.querySelector("b")?.textContent).toBe("Terms")
  })

  it("renders a param injected into an HTML translation as text", () => {
    setTranslation({ welcome: "<p>Hello <b>{{name}}</b></p>" })
    const name = '<img src="x" onerror="alert(1)"><script>alert(2)</script>'
    const { container } = render(<Trans params={{ name }}>welcome</Trans>)

    // The markup of the dictionary is kept…
    expect(container.querySelector("p > b")?.textContent).toBe(name)
    // …but the param adds no element of its own.
    expect(container.querySelector("img")).toBeNull()
    expect(container.querySelector("script")).toBeNull()
  })

  it("renders a param that is itself markup as text", () => {
    setTranslation({ greeting: "{{name}}" })
    const name = '<b onmouseover="alert(1)">Sam</b>'
    const { container } = render(<Trans params={{ name }}>greeting</Trans>)

    expect(container.querySelector("b")).toBeNull()
    expect(container.textContent).toBe(name)
  })

  it("updates a mounted Trans after setTranslation", () => {
    setTranslation({ hello: "Hello" })
    render(<Trans>hello</Trans>)

    act(() => setTranslation({ hello: "Bonjour" }))

    expect(screen.getByText("Bonjour")).toBeInTheDocument()
  })

  it("updates a mounted Trans after addTrans", () => {
    render(<Trans>hello</Trans>)
    expect(screen.getByText("hello")).toBeInTheDocument()

    act(() => addTrans("hello", "Hello"))

    expect(screen.getByText("Hello")).toBeInTheDocument()
  })

  it("does not render again when the dictionary does not change", () => {
    const dictionary = { hello: "Hello" }
    setTranslation(dictionary)
    let commits = 0
    render(
      <Profiler id="trans" onRender={() => commits++}>
        <Trans>hello</Trans>
      </Profiler>
    )
    const before = commits

    act(() => {
      setTranslation(dictionary)
      addTrans("hello", "Hello")
    })

    expect(commits).toBe(before)
  })

  it("prefers the translate function provided by the context", () => {
    setTranslation({ hello: "Hello" })
    render(
      <TranslationContext.Provider
        value={{
          translations: {},
          updateTranslations: () => {},
          translate: () => "From the context",
        }}
      >
        <Trans>hello</Trans>
      </TranslationContext.Provider>
    )
    expect(screen.getByText("From the context")).toBeInTheDocument()
  })
})
