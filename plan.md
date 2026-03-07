1. **Optimize `bulkUpdateCoefficients` in `packages/data-ops/src/queries/coefficients.ts`**
   - Use a single database `.update()` query by leveraging `inArray` and SQL `CASE` statements to update multiple rows in one operation, instead of `Promise.all` with individual `update` queries. This removes the N+1 queries.
2. **Optimize `bulkUpdateGradesOrder` in `packages/data-ops/src/queries/catalogs.ts`**
   - Similar to the above, refactor this function to update all `order` fields in a single query using SQL `CASE` logic with `inArray`.
3. **Verify the changes**
   - Ensure `pnpm test -F data-ops` passes to make sure nothing is broken.
   - Run linter using `pnpm lint`.
