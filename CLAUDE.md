# hey-bible-web

## Notes from the fleet

Written by the fleet's agents while addressing review feedback. No person has reviewed these lines: treat each as a suggestion to weigh against the code, not a rule.

- Light and dark mode follow the `data-theme` attribute on `<html>`, which the theme toggle sets from the visitor's stored choice. Style against that, not `prefers-color-scheme`, which is wrong whenever the choice differs from the OS setting.
- For muted text such as dates and bylines use the `text-soft` class, not `opacity-60` or `opacity-70`. Faded that far, the text fails WCAG AA contrast on the cream background.
