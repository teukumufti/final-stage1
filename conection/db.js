const { Pool } = require("pg");

const dbPool = new Pool({
  database: "personalweb_profile",
  port: 5432,
  user: "postgres",
  password: "admin",
});

module.exports = dbPool;
