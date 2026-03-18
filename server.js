const express = require("express");

const app = express();

// health check
app.get("/health", (req, res) => {
  console.log("HEALTH HIT");
  res.send("OK");
});

// test route
const axios = require("axios");

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

app.get("/merge", async (req, res) => {
  console.log("MERGE DIRECT TEST");

  const tempDir = `/tmp/test`;
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    const files = [
      "kus-1773770385596.webm",
      "kus-1773770385615.webm"
    ];

    const base = "https://kus-upload.jbehrens57.workers.dev/video";

    for (let i = 0; i < files.length; i++) {
      const url = `${base}/${files[i]}`;
      const filePath = path.join(tempDir, `seg${i}.webm`);

      const response = await fetch(url);
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
    }

    const listPath = path.join(tempDir, "list.txt");
    const listContent = files
      .map((_, i) => `file seg${i}.webm`)
      .join("\n");

    fs.writeFileSync(listPath, listContent);

    await new Promise((resolve, reject) => {
      exec(
        `cd ${tempDir} && ffmpeg -f concat -safe 0 -i list.txt -c copy output.webm`,
        (err, stdout, stderr) => {
          console.log(stderr);
          if (err) reject(err);
          else resolve();
        }
      );
    });

    const output = fs.readFileSync(path.join(tempDir, "output.webm"));

    res.setHeader("Content-Type", "video/webm");
    res.send(output);

  } catch (err) {
    console.error(err);
    res.status(500).send("MERGE FAILED");
  }
});
