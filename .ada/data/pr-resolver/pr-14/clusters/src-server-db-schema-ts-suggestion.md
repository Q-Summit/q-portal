# Cluster: src-server-db-schema-ts-suggestion

## Context

| Property   | Value                            |
| ---------- | -------------------------------- |
| PR         | #14                              |
| Repository | Q-Summit/q-portal                |
| File       | `src/server/db/schema.ts`        |
| Concern    | suggestion                       |
| Status     | false (0 unresolved, 1 resolved) |

## Comments

### Comment 2949147252 [RESOLVED]

- **Line**: 196
- **Author**: cubic-dev-ai[bot]
- **Category**: suggestion
- **Severity**:
- **URL**: https://github.com/Q-Summit/q-portal/pull/14#discussion_r2949147252
- **Thread ID**: PRRT_kwDOQS2Asc50-L7D

**Body**:

````
<!-- metadata:{"confidence":8} -->
P2: `shiftSkills` allows duplicate (shiftId, talentId) pairs — there's no unique constraint on the natural key. Consider adding a composite unique index (or switching to a composite PK like `userTalent` does) to prevent duplicates at the DB level.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At src/server/db/schema.ts, line 196:

<comment>`shiftSkills` allows duplicate (shiftId, talentId) pairs — there's no unique constraint on the natural key. Consider adding a composite unique index (or switching to a composite PK like `userTalent` does) to prevent duplicates at the DB level.</comment>

<file context>
@@ -155,3 +156,57 @@ export const userTalent = sqliteTable(
+  }),
+);
+
+export const shiftSkills = sqliteTable("shift_skills", {
+  id: text("id").primaryKey(),
+  shiftId: text("shiftId")
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
