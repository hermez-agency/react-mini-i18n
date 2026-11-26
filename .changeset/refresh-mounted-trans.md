---
"react-mini-i18n": patch
---

Refresh mounted `<Trans>` after `setTranslation()` or `addTrans()`: the
dictionary is now observable, so changing it (for instance to switch language)
updates what is already on screen. Nothing re-renders when the dictionary does
not change.
