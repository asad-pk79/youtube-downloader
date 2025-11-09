import express from "express";
import cors from "cors";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// simple test route
app.get("/", (req, res) => {
  res.send("Server running — YouTube Downloader backend ready.");
});

// main download route
app.get("/api/download", async (req, res) => {
  const videoUrl = req.query.url;
  const format = req.query.format; // mp3 or mp4

  if (!videoUrl || !format) {
    return res.status(400).json({ error: "Missing url or format" });
  }

  // sanitize link
  if (!videoUrl.startsWith("http")) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  const safeFile = Date.now();
  const ext = format === "mp3" ? "mp3" : "mp4";
  const output = path.join(__dirname, `${safeFile}.%(ext)s`);

  // yt-dlp command
  const command = `yt-dlp -f "best[ext=${ext}]" -o "${output}" --extract-audio --audio-format mp3 --no-playlist ${videoUrl}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("yt-dlp error:", stderr);
      return res.status(500).json({ error: "Download failed" });
    }

    // Send the file to the browser
    res.download(`${__dirname}/${safeFile}.${ext}`, err => {
      if (err) console.error("Download error:", err);
    });
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
