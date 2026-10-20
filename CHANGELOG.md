# react-mini-i18n

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
