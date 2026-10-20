# react-mini-i18n

Translation for React, cut down to the essentials: a `key → text` dictionary, a
function, a component. No file format imposed, no loader, no configuration — you
hand it an object, it looks things up.

```tsx
import { setTranslation, Trans } from "react-mini-i18n"

setTranslation({ hello: "Hello", greeting: "Hello {{name}}" })

;<Trans>hello</Trans> // → Hello
;<Trans params={{ name: "Sam" }}>greeting</Trans> // → Hello Sam
```

A key missing from the dictionary is rendered as-is: untranslated text stays
readable, and you can use the sentence itself as the key.

## Installation

```bash
pnpm add react-mini-i18n
```

`react` (18.3+ or 19) is a peer dependency.

## API

### `translate(key, params?)`

Translates outside of React rendering — error messages, notifications,
attributes.

```ts
import { translate } from "react-mini-i18n"

toast.error(translate("The form is invalid"))
translate("Hello {{name}}", { name: "Sam" })
```

### `<Trans>`

The component equivalent. If the translation is an HTML fragment
(`"<b>Terms</b>"`), it is rendered as markup; otherwise the text is rendered
as-is.

```tsx
<Trans className="text-sm" params={{ count: 3 }}>
  {"{{count}} results"}
</Trans>
```

### Filling the dictionary

```ts
import { setTranslation, addTrans, arrayToTranslationObject } from "react-mini-i18n"

setTranslation({ hello: "Hello" }) // replaces the whole dictionary
addTrans("bye", "Goodbye") // adds a single entry

// From a { key, value } list, as an API would serve it
setTranslation(arrayToTranslationObject(await api.get("/translations")))
```

`getTranslations()` returns the current dictionary and `hasTranslation(key)`
reports whether a key exists (case-insensitive).

### Loading asynchronously

`TranslationProvider` fetches the dictionary on mount and renders its children
only once the response arrives — which keeps raw keys from flashing on screen
while loading.

```tsx
<TranslationProvider provider={() => api.get("/translations")}>
  <App />
</TranslationProvider>
```

Components below the provider can read the context to trigger a reload:

```ts
const { translations, updateTranslations } = useTranslationContext()
```

## One dictionary per application

The dictionary is a module-level singleton. If two copies of the package end up
in `node_modules`, each gets its own and half your translations will appear to
be ignored.

In practice: libraries that use it should declare `react-mini-i18n` as a
**peerDependency**, never a dependency — as
[`react-data-form`](https://github.com/hermez-agency/react-data-form) does.

## Development

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

### Releasing

```bash
pnpm changeset   # describe the change and its impact
```

CI publishes to npm once merged to `main`.

## License

MIT

---

A Hermez product — [hermez.dev](https://hermez.dev).
