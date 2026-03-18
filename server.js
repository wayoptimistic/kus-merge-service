const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();

app.get("/health", (req, res) => {
  res.send("OK");
});

// 🔥 MERGE ENDPOINT
app.get("/merge", async (req, res) => {
  const sessionId = req.query.sessionId;

  if (!sessionId) {
    return res.status(400).send("Missing sessionId");
  }

  const tempDir = `/tmp/${sessionId}`;
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    const workerBase = "https://kus-upload.jbehrens57.workers.dev";

    // 1. Get list of segments
    const listRes = await fetch(`${workerBase}/list?sessionId=${sessionId}`);
    const files = await listRes.json();

    if (!files.length) {
      return res.status(404).send("No segments found");
    }

    // 2. Download each segment
    for (let i = 0; i < files.length; i++) {
      const fileUrl = `${workerBase}/video/${files[i].name}`;
      const filePath = path.join(tempDir, `seg${i}.webm`);

      const fileRes = await fetch(fileUrl);
      const buffer = Buffer.from(await fileRes.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
    }

    // 3. Create concat list
    const listFile = path.join(tempDir, "list.txt");
    const listContent = files
      .map((_, i) => `file 'seg${i}.webm'`)
      .join("\n");

    fs.writeFileSync(listFile, listContent);

    const outputFile = path.join(tempDir, "output.webm");

    // 4. Merge with FFmpeg
    await new Promise((resolve, reject) => {
  exec(
    `cd ${tempDir} && ffmpeg -f concat -safe 0 -i list.txt -c copy output.webm`,
    (err, stdout, stderr) => {
      console.log("FFMPEG STDOUT:", stdout);
      console.log("FFMPEG STDERR:", stderr);

      if (err) reject(err);
      else resolve();
    }
  );
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
