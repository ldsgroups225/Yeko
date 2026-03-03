## 2024-06-25 - [Optimize Teacher Progress Summary]
**Learning:** Found a potential performance bottleneck with N+1 `curriculumProgress.findFirst` queries happening sequentially in a loop inside `getTeacherProgressSummary`. Sequential I/O latency adds up quickly if a teacher has many class-subject combinations.
**Action:** Replaced the sequential `for...of` loop with concurrent execution using `Promise.all` mapping over the array of queries. This takes advantage of connection pooling to run queries in parallel and reduce overall execution time.
