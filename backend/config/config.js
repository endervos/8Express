const env = process.env.NODE_ENV || "development";

require("dotenv").config({
  path: env === "docker" ? ".env.docker" : ".env.local"
});

module.exports = {
  development: {
    username: "root",
    password: "tra242812",
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    timezone: "+07:00",
    dialectOptions: {
      charset: "utf8mb4",
      dateStrings: true,
      typeCast: true
    },
    define: {
      underscored: true,
      freezeTableName: true,
      timestamps: false
    }
  },

  docker: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    timezone: "+07:00",
    dialectOptions: {
      charset: "utf8mb4",
      dateStrings: true,
      typeCast: true
    },
    define: {
      underscored: true,
      freezeTableName: true,
      timestamps: false
    }
  }
};