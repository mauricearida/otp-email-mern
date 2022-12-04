const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://maurice:asdasd123@cluster0.gkc8uhj.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(console.log("our db is connected"))
  .catch((err) => console.log(err));
