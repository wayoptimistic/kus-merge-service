const express = require("express");

const app = express();

// health check
app.get("/health", (req, res) => {
  console.log("HEALTH HIT");
  res.send("OK");
});

// test route
const axios = require("axios");

app.get("/merge", async (req, res) => {
  console.log("MERGE AXIOS TEST");

  try {
    const response = await axios.get(
      "https://kus-upload.jbehrens57.workers.dev/list",
      { timeout: 5000 }
    );

    console.log("AXIOS STATUS:", response.status);

    res.json(response.data);

  } catch (err) {
    console.error("AXIOS ERROR:", err.message);
    res.status(500).send("AXIOS FAILED");
  }
});
