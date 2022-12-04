const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/s", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("our db is connected"))
  .catch((err) => console.log(err));
