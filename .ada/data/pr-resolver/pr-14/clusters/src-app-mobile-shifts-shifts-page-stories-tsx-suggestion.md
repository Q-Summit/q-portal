# Cluster: src-app-mobile-shifts-shifts-page-stories-tsx-suggestion

## Context

| Property   | Value                                             |
| ---------- | ------------------------------------------------- |
| PR         | #14                                               |
| Repository | Q-Summit/q-portal                                 |
| File       | `src/app/(mobile)/shifts/shifts-page.stories.tsx` |
| Concern    | suggestion                                        |
| Status     | true (2 unresolved, 0 resolved)                   |

## Comments

### Comment 2949147193 [UNRESOLVED]

- **Line**: 301
- **Author**: cubic-dev-ai[bot]
- **Category**: suggestion
- **Severity**:
- **URL**: https://github.com/Q-Summit/q-portal/pull/14#discussion_r2949147193
- **Thread ID**: PRRT_kwDOQS2Asc50-L6Q

**Body**:

````
<!-- metadata:{"confidence":9} -->
P2: These "CalendarView" stories never switch `ShiftManager` out of its default list mode, so they do not actually render or verify the calendar state.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At src/app/(mobile)/shifts/shifts-page.stories.tsx, line 300:

<comment>These "CalendarView" stories never switch `ShiftManager` out of its default list mode, so they do not actually render or verify the calendar state.</comment>

<file context>
@@ -1,128 +1,349 @@
+/**
+ * Calendar view - showing shifts by time slots.
+ */
+export const CalendarView: Story = {
+  parameters: {
+    msw: {
</file context>
````

</details>

<a href="https://www.cubic.dev/action/fix/violation/b547a2b6-2b8c-42e3-9e08-736af6f76d6e" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with Cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>
```

---

### Comment 2949147284 [UNRESOLVED]

- **Line**: 278
- **Author**: cubic-dev-ai[bot]
- **Category**: suggestion
- **Severity**:
- **URL**: https://github.com/Q-Summit/q-portal/pull/14#discussion_r2949147284
- **Thread ID**: PRRT_kwDOQS2Asc50-L7d

**Body**:

````
<!-- metadata:{"confidence":8} -->
P3: Mock the default `shift.list` query in this loading story; otherwise it can hit an unhandled request instead of staying in the intended loading state.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At src/app/(mobile)/shifts/shifts-page.stories.tsx, line 263:

<comment>Mock the default `shift.list` query in this loading story; otherwise it can hit an unhandled request instead of staying in the intended loading state.</comment>

<file context>
@@ -1,128 +1,349 @@
+/**
+ * Loading state - while fetching data.
+ */
+export const ListViewLoading: Story = {
+  parameters: {
+    msw: {
</file context>
````

</details>

```suggestion
export const ListViewLoading: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", async () => {
          await new Promise((resolve) => setTimeout(resolve, 100000));
          return {
            user: mockUser,
            profile: mockRegularProfile,
          };
        }),
        trpcQuery("shift", "list", async () => {
          await new Promise((resolve) => setTimeout(resolve, 100000));
          return {
            items: [],
            total: 0,
            nextCursor: null,
          };
        }),
      ],
    },
  },
};
```

<a href="https://www.cubic.dev/action/fix/violation/fe755a28-2a23-4916-b388-cc627941f16b" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with Cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>
```

---

## Completion Requirement

**You must process ALL 2 unresolved comments above before completing.**
Do not return until every [UNRESOLVED] comment has been:

- Fixed and resolved, OR
- Dismissed with evidence, OR
- Deferred with documentation

## Resolution Commands

After fixing issues in this cluster:

```bash
# Resolve a specific comment thread
bash skills/resolve-pr-comments/scripts/pr-resolver-resolve.sh 14 <COMMENT_ID>

# Dismiss as false positive
bash skills/resolve-pr-comments/scripts/pr-resolver-dismiss.sh 14 <COMMENT_ID> "reason"
```
