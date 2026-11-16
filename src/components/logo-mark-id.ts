// Counts the logo marks drawn on each page. It lives outside the component
// because frontmatter runs afresh for every mark.
const marksOnPage = new WeakMap<Request, number>();

export function nextLogoMarkId(page: Request): string {
  const count = (marksOnPage.get(page) ?? 0) + 1;
  marksOnPage.set(page, count);
  return `logo-mark-${count}`;
}
