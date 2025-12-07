const mongoose = require("mongoose");
const express = require("express");
const secure = require("ssl-express-www");
const path = require("path");
const cors = require("cors");

// Load environment variables
require("dotenv").config();

// Debug: Check if environment variables are loaded
console.log("=== Environment Variables Debug ===");
console.log("ATLAS_URI:", process.env.ATLAS_URI);
console.log("Password:", process.env.password ? "Set" : "Not Set");
console.log("PORT:", process.env.PORT);
console.log("===================================");

const app = express();
const port = process.env.PORT || 5000;

app.use(secure);
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.ATLAS_URI;

// Check if URI exists before connecting
if (!uri) {
  console.error("ERROR: ATLAS_URI is not defined in .env file!");
  console.error("Please create a .env file in the root directory with:");
  console.error("ATLAS_URI=mongodb://localhost:27017/portfolio");
  process.exit(1);
}

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

const msgRouter = require("./routes/msg");
const loginRouter = require("./routes/login");

app.use("/api/msg", msgRouter);
app.use("/api/login", loginRouter);

// Serve static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});