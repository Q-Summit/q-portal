## 2026-03-13

- Added `isHeadOf` directly on Better Auth `user` table as a boolean (`integer` with `mode: "boolean"`, default `false`) to keep role metadata colocated with auth identity for upcoming planner checks.
- Modeled shift planning with separate normalized tables: `shifts`, `shift_slots`, `shift_skills`, `shift_tools`.
- Used explicit named indexes for expected query paths: `shifts.startTime`, `shifts.location`, and `shift_slots.slotTime`.
