const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoute = require("./routes/auth");

dotenv.config();
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGOCONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("db connection success");
  })
  .catch((err) => {
    console.log(err);
  });

// const corsOptions = {
//   origin: ["https://", ""],
// };

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoute);

app.listen(process.env.PORT || 500, () => {
  console.log("Server is run");
});
