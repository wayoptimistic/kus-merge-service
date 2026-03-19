const express = require("express");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("KUS Merge Server Running");
});

app.post("/merge", async (req, res) => {
  try {
    const { files } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).send("No files provided");
    }

    const localFiles = [];

    for (let i = 0; i < files.length; i++) {
      const url = files[i];
      const filename = `/tmp/segment-${i}.webm`;

      const response = await fetch(url);
      const buffer = await response.buffer();

      fs.writeFileSync(filename, buffer);
      localFiles.push(filename);
    }

    const listFile = "/tmp/filelist.txt";
    const content = localFiles.map(f => `file '${f}'`).join("\n");
    fs.writeFileSync(listFile, content);

    const output = `/tmp/merged-${Date.now()}.webm`;

    ffmpeg()
      .input(listFile)
      .inputOptions(["-f concat", "-safe 0"])
      .outputOptions(["-c copy"])
      .output(output)
      .on("end", () => {
        res.download(output, () => {
          fs.unlinkSync(output);
          fs.unlinkSync(listFile);
          localFiles.forEach(f => fs.unlinkSync(f));
        });
      })
      .on("error", err => {
        console.error(err);
        res.status(500).send("Merge failed");
      })
      .run();

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));
