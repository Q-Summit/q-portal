# Cluster: src-domain-qsum-shifts-validation-ts-issue

## Context

| Property   | Value                                  |
| ---------- | -------------------------------------- |
| PR         | #14                                    |
| Repository | Q-Summit/q-portal                      |
| File       | `src/domain/qsum/shifts/validation.ts` |
| Concern    | issue                                  |
| Status     | true (1 unresolved, 0 resolved)        |

## Comments

### Comment 2949480924 [UNRESOLVED]

- **Line**: 119
- **Author**: cubic-dev-ai[bot]
- **Category**: issue
- **Severity**:
- **URL**: https://github.com/Q-Summit/q-portal/pull/14#discussion_r2949480924
- **Thread ID**: PRRT_kwDOQS2Asc50_JtW

**Body**:

````
<!-- metadata:{"confidence":9} -->
P2: Blank `notionLink` values still fail schema validation before `blankToNull` runs, so clearing the optional Notion link remains broken.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At src/domain/qsum/shifts/validation.ts, line 119:

<comment>Blank `notionLink` values still fail schema validation before `blankToNull` runs, so clearing the optional Notion link remains broken.</comment>

<file context>
@@ -87,20 +103,25 @@ export type ShiftUpdateInput = z.infer<typeof ShiftUpdateSchema>;
-    description: input.description?.trim() ?? null,
-    notionLink: input.notionLink?.trim() ?? null,
+    description: blankToNull(input.description),
+    notionLink: blankToNull(input.notionLink),
     startTime: input.startTime,
     endTime: input.endTime,
</file context>
````

</details>

<a href="https://www.cubic.dev/action/fix/violation/1a0e54c7-91f2-4112-ba25-3c3d82a35003" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with Cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>
```

---

## Completion Requirement

**You must process ALL 1 unresolved comments above before completing.**
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
