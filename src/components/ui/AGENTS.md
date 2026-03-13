# UI Components

## OVERVIEW

shadcn/ui component library using Radix primitives, CVA for variants, and Tailwind CSS.

## WHERE TO LOOK

| Component   | File              | Pattern                                             |
| ----------- | ----------------- | --------------------------------------------------- |
| Button      | `button.tsx`      | CVA variants + asChild support                      |
| Card        | `card.tsx`        | Compound components (CardHeader, CardContent, etc.) |
| Checkbox    | `checkbox.tsx`    | Radix primitive wrapper                             |
| Input       | `input.tsx`       | Native element wrapper                              |
| Label       | `label.tsx`       | Radix primitive wrapper                             |
| Progress    | `progress.tsx`    | Radix primitive wrapper                             |
| Radio Group | `radio-group.tsx` | Radix primitive wrapper                             |
| Select      | `select.tsx`      | Radix primitive with Portal                         |
| Switch      | `switch.tsx`      | Radix primitive wrapper                             |

## CONVENTIONS

**Variants:** Use CVA (`class-variance-authority`) for component variants. Define `variants` object with `defaultVariants`.

**Class merging:** Always use `cn()` from `@/lib/utils` to merge Tailwind classes.

**forwardRef:** For legacy compatibility, wrap with `React.forwardRef`. In React 19, refs forward automatically without wrapper.

**displayName:** Set `displayName` on every component for debugging.

**Radix primitives:** Import from `@radix-ui/react-*`. Re-export sub-components (e.g., `SelectTrigger`, `SelectContent`).

**Client components:** Add `"use client"` for hooks, event handlers, browser APIs, providers, or client-library wrappers.

## ANTI-PATTERNS

- ❌ Inline styles instead of Tailwind classes
- ❌ Missing `displayName` on forwarded components
- ❌ Direct DOM manipulation without refs
- ❌ Props spreading without type safety

## TESTING

Test via Storybook stories with `play` functions. Stories live in `*.stories.tsx` files alongside components. No separate `*.test.tsx` files for UI components.
