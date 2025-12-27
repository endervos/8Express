"use strict";
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { sequelize } = require("./models");
const os = require("os");

require("dotenv").config({
  path: process.env.NODE_ENV === "docker" ? ".env.docker" : ".env.local"
});

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: "25mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "25mb" }));

sequelize.authenticate()
  .catch(err => console.error("Lỗi kết nối MySQL:", err));

if (process.env.NODE_ENV !== "docker") {
  sequelize.sync()
    .catch(err => console.error("Lỗi sync DB:", err));
}

app.get("/", (req, res) => res.send("Server 8Express đang hoạt động!"));
app.use("/auth", require("./routes/auth"));
app.use("/posts", require("./routes/post"));
app.use("/profile", require("./routes/profile"));
app.use("/topics", require("./routes/topics"));
app.use("/follow", require("./routes/follow"));
app.use("/comments", require("./routes/comments"));
app.use("/share", require("./routes/share"));
app.use("/admin", require("./routes/admin"));

const localIP = getLocalIP();
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server đang chạy tại http://${localIP}:${PORT}`);
});