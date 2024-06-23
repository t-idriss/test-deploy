const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const bookRoute = require("./routes/book");
const productRoute = require("./routes/product");
const overviewRoute = require("./routes/overview");
const serverless = require("serverless-http");
const router = express.Router();

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
//   origin: ["http://localhost:3000", ""],
// };

app.use(cors());

app.use(express.json());

// app.use("/api/auth", authRoute);
// app.use("/api/users", userRoute);
// app.use("/api/blogs", blogRoute);
// app.use("/api/books", bookRoute);
// app.use("/api/products", productRoute);
// app.use("/api/overviews", overviewRoute);


router.get("/", (req, res) => {
  res.send("App is running..");
});

// app.listen(process.env.PORT || 500, () => {
//   console.log("Server is run");
// });

app.use("/.netlify/functions/app", router);

module.exports.handler = serverless(app);
