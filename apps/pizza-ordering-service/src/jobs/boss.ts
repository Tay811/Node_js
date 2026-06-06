import { PgBoss } from 'pg-boss';

const connectionString =
    process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/pizza';

export const boss = new PgBoss({
    connectionString
});