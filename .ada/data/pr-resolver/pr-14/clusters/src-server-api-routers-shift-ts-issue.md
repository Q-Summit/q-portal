# Cluster: src-server-api-routers-shift-ts-issue

## Context

| Property   | Value                             |
| ---------- | --------------------------------- |
| PR         | #14                               |
| Repository | Q-Summit/q-portal                 |
| File       | `src/server/api/routers/shift.ts` |
| Concern    | issue                             |
| Status     | false (0 unresolved, 1 resolved)  |

## Comments

### Comment 2949147166 [RESOLVED]

- **Line**: 356
- **Author**: cubic-dev-ai[bot]
- **Category**: issue
- **Severity**:
- **URL**: https://github.com/Q-Summit/q-portal/pull/14#discussion_r2949147166
- **Thread ID**: PRRT_kwDOQS2Asc50-L57

**Body**:

````
<!-- metadata:{"confidence":8} -->
P1: `setHours(0, 0, 0, 0)` uses the server's local timezone to compute day boundaries. If the server doesn't run in UTC (common in deployment), the calendar query window shifts incorrectly—e.g., in CET it would query from 22:00 UTC the previous day to 22:00 UTC of the target day, returning wrong slots. Use `setUTCHours` and UTC date methods instead.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At src/server/api/routers/shift.ts, line 356:

<comment>`setHours(0, 0, 0, 0)` uses the server's local timezone to compute day boundaries. If the server doesn't run in UTC (common in deployment), the calendar query window shifts incorrectly—e.g., in CET it would query from 22:00 UTC the previous day to 22:00 UTC of the target day, returning wrong slots. Use `setUTCHours` and UTC date methods instead.</comment>

<file context>
@@ -0,0 +1,529 @@
+    )
+    .query(async ({ ctx, input }) => {
+      const dayStart = new Date(input.date);
+      dayStart.setHours(0, 0, 0, 0);
+
+      const dayEnd = new Date(dayStart);
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
