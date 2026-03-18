{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww35640\viewh19260\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const express = require("express")\
const fetch = require("node-fetch")\
const fs = require("fs")\
const \{ exec \} = require("child_process")\
\
const app = express()\
\
const BASE_URL = "https://kus-upload.jbehrens57.workers.dev"\
\
app.get("/merge", async (req, res) => \{\
  const session = req.query.session\
\
  if (!session) \{\
    return res.status(400).send("Missing session")\
  \}\
\
  try \{\
    const listRes = await fetch(`$\{BASE_URL\}/list`)\
    const files = await listRes.json()\
\
    const sessionFiles = files\
      .map(f => f.name)\
      .filter(name => name.includes(`kus-$\{session\}-`))\
      .sort()\
\
    if (sessionFiles.length === 0) \{\
      return res.status(404).send("No files found")\
    \}\
\
    const fileList = []\
\
    for (let i = 0; i < sessionFiles.length; i++) \{\
      const filename = sessionFiles[i]\
      const url = `$\{BASE_URL\}/video/$\{filename\}`\
\
      const resVideo = await fetch(url)\
      const buffer = await resVideo.buffer()\
\
      const localFile = `segment-$\{i\}.webm`\
      fs.writeFileSync(localFile, buffer)\
\
      fileList.push(`file '$\{localFile\}'`)\
    \}\
\
    fs.writeFileSync("list.txt", fileList.join("\\n"))\
\
    exec("ffmpeg -f concat -safe 0 -i list.txt -c copy output.webm", (err) => \{\
      if (err) \{\
        console.error(err)\
        return res.status(500).send("FFmpeg error")\
      \}\
\
      res.download("output.webm", `KUS-$\{session\}.webm`, () => \{\
        fs.unlinkSync("output.webm")\
        fs.unlinkSync("list.txt")\
        sessionFiles.forEach((_, i) => fs.unlinkSync(`segment-$\{i\}.webm`))\
      \})\
    \})\
\
  \} catch (err) \{\
    console.error(err)\
    res.status(500).send("Merge failed")\
  \}\
\})\
\
app.listen(3000, () => \{\
  console.log("Merge service running on port 3000")\
\})}