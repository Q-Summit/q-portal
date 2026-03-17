# Cluster: src-components-shifts-csv-export-button-stories-tsx-issue

## Context

| Property   | Value                                                 |
| ---------- | ----------------------------------------------------- |
| PR         | #14                                                   |
| Repository | Q-Summit/q-portal                                     |
| File       | `src/components/shifts/csv-export-button.stories.tsx` |
| Concern    | issue                                                 |
| Status     | false (0 unresolved, 1 resolved)                      |

## Comments

### Comment 2949147221 [RESOLVED]

- **Line**: 112
- **Author**: cubic-dev-ai[bot]
- **Category**: issue
- **Severity**:
- **URL**: https://github.com/Q-Summit/q-portal/pull/14#discussion_r2949147221
- **Thread ID**: PRRT_kwDOQS2Asc50-L6o

**Body**:

````
<!-- metadata:{"confidence":9} -->
P2: Match the MSW handler to `/api/trpc/shift.exportCsv`; the current route never intercepts this mutation, so the error story won't render the failure state.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At src/components/shifts/csv-export-button.stories.tsx, line 112:

<comment>Match the MSW handler to `/api/trpc/shift.exportCsv`; the current route never intercepts this mutation, so the error story won't render the failure state.</comment>

<file context>
@@ -0,0 +1,164 @@
+  parameters: {
+    msw: {
+      handlers: [
+        http.post("*/api/trpc", async ({ request }) => {
+          const body = (await request.json()) as { json?: { params?: { path?: string } } };
+          const path = body?.json?.params?.path;
</file context>
````

</details>

✅ Addressed in [`018cd1f`](https://github.com/Q-Summit/q-portal/commit/018cd1f5c16d87f8617323aa13c03e524568e85a)

````

---

## Completion Requirement

**You must process ALL 0 unresolved comments above before completing.**
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
````
