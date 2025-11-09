import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import cors from "cors";
import fs from "fs";
import { exec } from "child_process";
import ytdl from "yt-dlp-exec";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.post("/api/download", async (req, res) => {
  const { url, format } = req.body;
  if (!url) return res.status(400).send("No URL provided.");

  const output = path.join(__dirname, `video.${format}`);

  try {
    await ytdl(url, {
      format: format === "mp3" ? "bestaudio" : "best",
      extractAudio: format === "mp3",
      audioFormat: format === "mp3" ? "mp3" : undefined,
      output: output
    });

    res.download(output, () => fs.unlinkSync(output));
  } catch (err) {
    console.error(err);
    res.status(500).send("Download failed.");
  }
});

app.get("/", (req, res) => res.send("Server running — YouTube Downloader backend ready."));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
