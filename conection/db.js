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
    host: "ec2-52-54-212-232.compute-1.amazonaws.com",
    database: "d7pk27unm9sl21",
    user: "jeirkfsmmwdywg",
    port: 5432,
    password:
      "c30e4ad072c30a727c9e8ecaa4495aa715d8b1374f8de761c1ae2a2a3f209c00",
  });
}

module.exports = client;
