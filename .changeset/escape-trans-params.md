---
"react-mini-i18n": patch
---

Escape `params` values before `<Trans>` injects them into an HTML translation.

A translation that is an HTML fragment is rendered as markup, so a value coming
from a user (a name, for instance) could inject a `<script>` or an `onerror=`
handler. Param values are now escaped first: they always render as text, while
the HTML of the dictionary itself renders as before. `translate()` is unchanged.
