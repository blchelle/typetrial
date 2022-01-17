const path = require("path");
const express = require("express");
const app = express();

app.get("/api/hello", (req, res) => {
  res.send("Hello World!");
});

app.use(express.static(path.join(__dirname, "..", "client", "dist")));
// app.use(express.static("public"));

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "client", "dist", "index.html"));
});

// start express server on port 8080
app.listen(8080, () => {
  console.log("server started on port 8080");
});
