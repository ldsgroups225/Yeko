## 2024-03-24 - Accessibility on Headless Components
**Learning:** Even when headless primitives (like Base UI's `DialogPrimitive.Close`) are wrapped around an icon button that contains `<span className="sr-only">`, explicitly passing `aria-label` and `title` to the rendered `<Button>` greatly improves the visual user experience by providing a native tooltip while reinforcing screen reader accessibility.
**Action:** Always add `aria-label` and `title` to custom `<Button size="icon">` implementations wrapping icons, even if an `sr-only` child exists within the root element.
