# @kurama/eslint-config

ESLint configuration for the Kurama project, based on [@antfu/eslint-config](https://github.com/antfu/eslint-config) with TypeScript and React support.

## Installation

Add this package to your workspace dependencies:

```bash
pnpm add -D @kurama/eslint-config @antfu/eslint-config eslint
```

## Usage

Create an `eslint.config.js` file in your project root:

```js
import kuramaConfig from '@kurama/eslint-config'

export default kuramaConfig
```

Or extend it with additional configuration:

```js
import kuramaConfig from '@kurama/eslint-config'

export default [
  ...kuramaConfig,
  {
    rules: {
      // Your custom rules here
    },
  },
]
```

## Configuration

This ESLint configuration includes:

- **TypeScript support**: Full TypeScript linting with proper type checking
- **React support**: React-specific linting rules and JSX support
- **Accessibility (a11y)**: JSX accessibility rules via `eslint-plugin-jsx-a11y`
- **Stylistic rules**: Consistent code formatting with:
  - 2-space indentation
  - Single quotes
  - No semicolons
  - ES5 trailing commas
- **Formatters**: Integrated formatting support
- **Ignore patterns**: Common build and dependency directories are ignored

## Features

### TypeScript
- Type checking
- Import/export validation
- Interface and type usage
- Generic type safety

### React
- JSX syntax support
- React hooks rules
- Component prop validation
- Accessibility checks

### Stylistic Rules
- Consistent indentation
- Quote style enforcement
- Semicolon policy
- Trailing comma rules

### Accessibility (a11y)
- Alt text for images and media
- ARIA attributes validation
- Keyboard navigation support
- Focus management
- Semantic HTML enforcement
- Component mapping for custom components (shadcn/ui, Kurama components)
- Polymorphic component support with `as` prop

**Key Rules:**
- `alt-text`: Enforce alternative text on images
- `aria-props`: Validate ARIA attributes
- `aria-role`: Enforce valid ARIA roles
- `click-events-have-key-events`: Ensure keyboard support for click handlers
- `heading-has-content`: Headings must have content
- `label-has-associated-control`: Labels must be associated with controls
- `interactive-supports-focus`: Interactive elements must be focusable
- `no-static-element-interactions`: Static elements shouldn't have event handlers

**Component Mapping:**
The configuration includes mappings for:
- shadcn/ui components (Button, Link, Card, Dialog, etc.)
- Kurama custom components (LevelBadge, AchievementBadge, StreakCalendar, LeaderboardWidget)

**Polymorphic Components:**
Supports polymorphic components using the `as` prop for Button, Link, and Card components.

## Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

## Workspace Usage

This package is designed to be used as a workspace dependency within the Kurama monorepo. Other packages and apps can reference it directly in their `eslint.config.js` files.

## Customization

To customize the configuration for your specific needs, you can:

1. Import the base configuration
2. Add your own rules and overrides
3. Extend with additional ESLint plugins

Example:

```js
import kuramaConfig from '@kurama/eslint-config'

export default [
  ...kuramaConfig,
  {
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
```

## Dependencies

- `@antfu/eslint-config`: Base configuration
- `eslint`: Core ESLint functionality
- `eslint-plugin-jsx-a11y`: Accessibility rules for JSX
- `eslint-plugin-better-tailwindcss`: Tailwind CSS linting
- `@eslint-react/eslint-plugin`: React-specific rules
- `eslint-plugin-react-hooks`: React hooks rules
- `eslint-plugin-react-refresh`: React refresh support
- `@vitest/eslint-plugin`: Vitest testing rules

## License

MIT
