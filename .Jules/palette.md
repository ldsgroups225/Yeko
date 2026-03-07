## 2024-03-24 - Accessibility on Headless Components
**Learning:** Even when headless primitives (like Base UI's `DialogPrimitive.Close`) are wrapped around an icon button that contains `<span className="sr-only">`, explicitly passing `aria-label` and `title` to the rendered `<Button>` greatly improves the visual user experience by providing a native tooltip while reinforcing screen reader accessibility.
**Action:** Always add `aria-label` and `title` to custom `<Button size="icon">` implementations wrapping icons, even if an `sr-only` child exists within the root element.

## 2024-05-18 - Missing ARIA Labels in Icon Buttons
**Learning:** Found an icon-only delete button in the teacher assignment page (`apps/school/src/routes/_auth/teachers/$teacherId/index.tsx`) without any accessible label. The icon itself provides no context for screen reader users.
**Action:** When creating icon-only action buttons (e.g., using Tabler Icons like `IconTrash`), always add an `aria-label` utilizing the application's i18n translation system (e.g., `aria-label={t.classes.removeSubject()}`) to ensure the purpose of the action is clear to all users.
