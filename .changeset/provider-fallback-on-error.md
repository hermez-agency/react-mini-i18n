---
"react-mini-i18n": minor
---

Add `fallback` and `onError` props to `TranslationProvider`.

`fallback` is rendered in place of the children while an asynchronous `provider` is loading. `onError` is called with the error when `provider` rejects; the children still render, with keys standing in for the translations.
