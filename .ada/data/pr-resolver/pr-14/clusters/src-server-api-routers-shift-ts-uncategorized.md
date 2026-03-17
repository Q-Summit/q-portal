# Cluster: src-server-api-routers-shift-ts-uncategorized

## Context

| Property   | Value                             |
| ---------- | --------------------------------- |
| PR         | #14                               |
| Repository | Q-Summit/q-portal                 |
| File       | `src/server/api/routers/shift.ts` |
| Concern    | uncategorized                     |
| Status     | false (0 unresolved, 4 resolved)  |

## Comments

### Comment 2949159038 [RESOLVED]

- **Line**: 440
- **Author**: Copilot
- **Category**: uncategorized
- **Severity**:
- **URL**: https://github.com/Q-Summit/q-portal/pull/14#discussion_r2949159038
- **Thread ID**: PRRT_kwDOQS2Asc50-OH4

**Body**:

```
`exportCsv` currently adds a UTF-8 BOM to the returned CSV (`"\uFEFF" + ...`). If the client is also adding a BOM, downloads will contain a double BOM. Align the API contract (either always include BOM server-side and never client-side, or vice versa) to avoid duplicate prefixes.
```

---

### Comment 2949159057 [RESOLVED]

- **Line**: 509
- **Author**: Copilot
- **Category**: uncategorized
- **Severity**:
- **URL**: https://github.com/Q-Summit/q-portal/pull/14#discussion_r2949159057
- **Thread ID**: PRRT_kwDOQS2Asc50-OII

**Body**:

```
`exportCsv` does `allShifts.find(...)` inside the loop over `allSlots`, making CSV generation O(shifts*slots). Build a `Map` from shiftId → shift once, then do O(1) lookups while iterating slots.
```

---

### Comment 2949528414 [RESOLVED]

- **Line**: 509
- **Author**: LukasStrickler
- **Category**: uncategorized
- **Severity**:
- **URL**: https://github.com/Q-Summit/q-portal/pull/14#discussion_r2949528414
- **Thread ID**: PRRT_kwDOQS2Asc50-OII

**Body**:

```
Dismissed: Fixed: O(n^2) algorithm optimized with Map lookup in commit 018cd1f
```

---

### Comment 2949528439 [RESOLVED]

- **Line**: 440
- **Author**: LukasStrickler
- **Category**: uncategorized
- **Severity**:
- **URL**: https://github.com/Q-Summit/q-portal/pull/14#discussion_r2949528439
- **Thread ID**: PRRT_kwDOQS2Asc50-OH4

**Body**:

```
Dismissed: Fixed: Aligned BOM handling - server adds BOM, client passes through
```

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
```
