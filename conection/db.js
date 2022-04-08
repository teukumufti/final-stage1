const { Pool, Client } = require("pg");

let client;

if (process.env.DEV) {
  client = new Pool({
    database: "personalweb_profile",
    port: 5432,
    user: "postgres",
    password: "admin",
  });
} else {
  client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

module.exports = client;
