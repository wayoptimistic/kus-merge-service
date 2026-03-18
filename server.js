const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();

app.get("/health", (req, res) => {
  res.send("OK");
});

// 🔥 MERGE ENDPOINT
app.get("/merge", (req, res) => {
  console.log("MERGE HIT");
  res.send("MERGE WORKING");
});

    // 5. Return merged video
    const video = fs.readFileSync(outputFile);
    res.setHeader("Content-Type", "video/webm");
    res.send(video);

  } catch (err) {
    console.error(err);
    res.status(500).send("Merge failed");
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
