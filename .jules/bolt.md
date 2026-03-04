## 2026-03-04 - [N+1 Query in Support Tickets]
**Learning:** Found an N+1 query vulnerability when getting the comment count for each ticket in `getTickets` because it used `Promise.all(tickets.map(...))`.
**Action:** Always batch queries with `inArray` or lateral joins to avoid Drizzle N+1.
