import pg from "pg";
const Pool = pg.Pool;

const data = {
  user: "postgres",
  password: "root",
  host: "localhost",
  port: 5432,
  database: "sweeft",
};

const pool: pg.Pool = new Pool(data);

export default pool;
