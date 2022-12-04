const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://maurice:mcOWRMghRSo8ljYf@cluster0.zqnfjtu.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(console.log("our db is connected"))
  .catch((err) => console.log(err));
