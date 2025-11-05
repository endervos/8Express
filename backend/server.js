"use strict";
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { sequelize } = require("./models");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: "25mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "25mb" }));

// ===== Kiểm tra kết nối DB =====
sequelize.authenticate()
  .then(() => console.log("Kết nối MySQL thành công"))
  .catch(err => console.error("Lỗi kết nối MySQL:", err));

sequelize.sync()
  .then(() => console.log("Sequelize đã sync"))
  .catch(err => console.error("Lỗi sync DB:", err));

// ===== ROUTES =====
app.get("/", (req, res) => res.send("Server 8Express đang hoạt động!"));
app.use("/auth", require("./routes/auth"));
app.use("/posts", require("./routes/post"));
app.use("/profile", require("./routes/profile"));
app.use("/topics", require("./routes/topics"));
app.use("/follow", require("./routes/follow"));
app.use("/comments", require("./routes/comments"));
app.use("/share", require("./routes/share"));
app.use("/admin", require("./routes/admin"));

app.listen(PORT, () => console.log(`Server đang chạy tại http://localhost:${PORT}`));