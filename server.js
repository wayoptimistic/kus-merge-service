const express = require("express");

const app = express();

// health check
app.get("/health", (req, res) => {
  console.log("HEALTH HIT");
  res.send("OK");
});

// test route
app.get("/merge", async (req, res) => {
  console.log("MERGE FETCH TEST");

  try {
    const fetch = require("node-fetch");

    const response = await fetch("https://kus-upload.jbehrens57.workers.dev/list");

    console.log("FETCH STATUS:", response.status);

    const text = await response.text();

    console.log("FETCH RESPONSE:", text.substring(0, 200));

    res.send("FETCH WORKED");

  } catch (err) {
    console.error("FETCH ERROR:", err);
    res.status(500).send("FETCH FAILED");
  }
});
