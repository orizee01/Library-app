import postgres from "postgres";

export const sql = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false });
