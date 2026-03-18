const express = require("express");

const app = express();

// health check
app.get("/health", (req, res) => {
  console.log("HEALTH HIT");
  res.send("OK");
});

// test route
app.get("/merge", async (req, res) => {
  console.log("MERGE STEP 1 HIT");

  const sessionId = req.query.sessionId;

  if (!sessionId) {
    return res.status(400).send("Missing sessionId");
  }

  try {
    const workerBase = "https://kus-upload.jbehrens57.workers.dev";

    const listRes = await fetch(`${workerBase}/list`);
    const allFiles = await listRes.json();

    const files = allFiles.filter(f =>
      f.name.includes(sessionId)
    );

    console.log("FILES FOUND:", files.length);

    if (!files.length) {
      return res.status(404).send("No segments found");
    }

    res.json(files);

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).send("Step 1 failed");
  }
});
