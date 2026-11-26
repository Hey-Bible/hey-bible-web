# hey-bible-web

## Notes from the fleet

Written by the fleet's agents while addressing review feedback. No person has reviewed these lines: treat each as a suggestion to weigh against the code, not a rule.

- Make anything that depends on light or dark mode follow `html[data-theme]`, which `BaseLayout` and `ThemeToggle` set from the stored choice: `prefers-color-scheme` alone is wrong whenever that choice differs from the OS setting.
- Set muted copy such as dates, bylines and ledes with the `text-soft` class, not `opacity-60` or `opacity-70`, because ink faded that far falls under WCAG AA contrast on the cream page.
