# Cluster: src-server-db-schema-ts-issue

## Context

| Property   | Value                            |
| ---------- | -------------------------------- |
| PR         | #14                              |
| Repository | Q-Summit/q-portal                |
| File       | `src/server/db/schema.ts`        |
| Concern    | issue                            |
| Status     | false (0 unresolved, 1 resolved) |

## Comments

### Comment 2949147176 [RESOLVED]

- **Line**: 172
- **Author**: cubic-dev-ai[bot]
- **Category**: issue
- **Severity**:
- **URL**: https://github.com/Q-Summit/q-portal/pull/14#discussion_r2949147176
- **Thread ID**: PRRT_kwDOQS2Asc50-L6C

**Body**:

````
<!-- metadata:{"confidence":9} -->
P1: Missing `onDelete` on `createdBy` FK — deleting a user who created shifts will fail with a constraint error. Add `onDelete: "cascade"` (consistent with other domain FKs) or make the column nullable and use `onDelete: "set null"` if you want to preserve shift records.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At src/server/db/schema.ts, line 172:

<comment>Missing `onDelete` on `createdBy` FK — deleting a user who created shifts will fail with a constraint error. Add `onDelete: "cascade"` (consistent with other domain FKs) or make the column nullable and use `onDelete: "set null"` if you want to preserve shift records.</comment>

<file context>
@@ -155,3 +156,57 @@ export const userTalent = sqliteTable(
+    endTime: integer("endTime", { mode: "timestamp" }).notNull(),
+    createdBy: text("createdBy")
+      .notNull()
+      .references(() => user.id),
+    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
+  },
</file context>
````

</details>

```suggestion
      .references(() => user.id, { onDelete: "cascade" }),
```

✅ Addressed in [`211ca78`](https://github.com/Q-Summit/q-portal/commit/211ca782045f967d2d1115eb252a5b193e13246d)

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
