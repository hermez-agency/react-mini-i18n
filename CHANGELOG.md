# react-mini-i18n

## 0.3.0

### Minor Changes

- 365a2d1: Add `fallback` and `onError` props to `TranslationProvider`.

  `fallback` is rendered in place of the children while an asynchronous `provider` is loading. `onError` is called with the error when `provider` rejects; the children still render, with keys standing in for the translations.

### Patch Changes

- f35f30b: Escape `params` values before `<Trans>` injects them into an HTML translation.

  A translation that is an HTML fragment is rendered as markup, so a value coming
  from a user (a name, for instance) could inject a `<script>` or an `onerror=`
  handler. Param values are now escaped first: they always render as text, while
  the HTML of the dictionary itself renders as before. `translate()` is unchanged.

- a656fea: Refresh mounted `<Trans>` after `setTranslation()` or `addTrans()`: the
  dictionary is now observable, so changing it (for instance to switch language)
  updates what is already on screen. Nothing re-renders when the dictionary does
  not change.

## 0.2.1

### Patch Changes

- 43c88cb: Move the package under Hermez: the repository now lives at
  `hermez-agency/react-mini-i18n`, and `author`, `repository`, `bugs` and
  `homepage` point there.

## 0.2.0

### Minor Changes

- Render children on a server, and accept a dictionary up front.

  `TranslationProvider` loaded its dictionary in an effect and returned `null`
  until it resolved. Effects never run during a server render, so the provider
  withheld the entire tree: a server-rendered page came back empty, and anything
  reading that markup — a crawler, a preview, a test — saw nothing at all.

  It now renders immediately, showing each key until its translation arrives, and
  takes an `initialTranslations` prop for dictionaries that are known up front.
  Pass it wherever the first render has to be complete; `provider` still applies
  its result on top once it resolves.
