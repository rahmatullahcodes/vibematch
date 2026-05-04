# DB Migration Notes

This project currently runs on a local JSON-backed mock datastore for rapid product iteration.

For production migration (Postgres/Mongo), use this folder as the baseline:

1. Provision managed DB (`Postgres` recommended for moderation analytics + joins).
2. Apply [`schema.sql`](./schema.sql) as initial migration.
3. Replace mock storage adapters in `src/mocks/mockApi.js` with repository methods.
4. Keep API contract unchanged while switching persistence layer.
5. Backfill existing users from `backend/data/local-storage.json` using a one-time import script.
