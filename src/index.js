require("dotenv").config();
require("./models/Receita");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const receitaRoutes = require("./routes/receitaRoutes");

app.use(bodyParser.json());
mongoose.connect(process.env.URI_DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => {
  console.log("Connected mongo instance");
});

mongoose.connection.on("error", (err) => {
  console.log("Error", err);
});
app.listen(8080, () => {
  console.log("Listening 8080");
});

app.use(receitaRoutes);
