const express = require("express");
const http = require("http");
const path = require("path");
const app = express();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "demo-chat.html"));
});

let readyAddresses = 0;
function reportReady() {
  readyAddresses += 1;
  if (readyAddresses === 2) {
    console.log("Demo conversation available at http://localhost:3000");
  }
}

app.listen(3000, "127.0.0.1", reportReady);
http.createServer(app).listen(3000, "::1", reportReady);
