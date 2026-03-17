# Cluster: src-server-api-routers-shift-ts-suggestion

## Context

| Property   | Value                             |
| ---------- | --------------------------------- |
| PR         | #14                               |
| Repository | Q-Summit/q-portal                 |
| File       | `src/server/api/routers/shift.ts` |
| Concern    | suggestion                        |
| Status     | true (1 unresolved, 0 resolved)   |

## Comments

### Comment 2949480938 [UNRESOLVED]

- **Line**: 526
- **Author**: cubic-dev-ai[bot]
- **Category**: suggestion
- **Severity**:
- **URL**: https://github.com/Q-Summit/q-portal/pull/14#discussion_r2949480938
- **Thread ID**: PRRT_kwDOQS2Asc50_Jti

**Body**:

````
<!-- metadata:{"confidence":9} -->
P2: Restore the UTF-8 BOM in the CSV response; both the docs and the download flow still assume BOM-prefixed output for Excel-compatible imports.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At src/server/api/routers/shift.ts, line 526:

<comment>Restore the UTF-8 BOM in the CSV response; both the docs and the download flow still assume BOM-prefixed output for Excel-compatible imports.</comment>

<file context>
@@ -522,8 +523,7 @@ export const shiftRouter = createTRPCRouter({

-    // UTF-8 BOM for German Excel compatibility
-    const csv = "\uFEFF" + rows.join("\n");
+    const csv = rows.join("\n");
     return { csv };
   }),
</file context>
````

</details>

<a href="https://www.cubic.dev/action/fix/violation/640d8279-4968-4ae4-b3cd-2d5c5bd4670d" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
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
