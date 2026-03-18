const express = require("express");

const app = express();

// health check
app.get("/health", (req, res) => {
  console.log("HEALTH HIT");
  res.send("OK");
});

// test route
app.get("/merge", (req, res) => {
  console.log("MERGE HIT");
  res.send("MERGE WORKING");
});

// fallback (important)
app.get("*", (req, res) => {
  res.send("Route working");
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
