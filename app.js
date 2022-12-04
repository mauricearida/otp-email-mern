const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./db");

const userRouter = require("./routes/user");

const app = express();

const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());
app.use("/api/user", userRouter);

app.listen(PORT, () => {
  console.log(`app is running on ${PORT}`);
});
// mailtrap.io
