import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { readFile, unlink, mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
  let tempDir: string | null = null;

  try {
    const { url, format } = await req.json();

    if (!url || !format) {
      return NextResponse.json(
        { error: "URL et format requis." },
        { status: 400 }
      );
    }

    if (!["mp3", "mp4"].includes(format)) {
      return NextResponse.json(
        { error: "Format invalide. Utilisez mp3 ou mp4." },
        { status: 400 }
      );
    }

    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)[\w-]+/;
    if (!youtubeRegex.test(url)) {
      return NextResponse.json(
        { error: "URL YouTube invalide." },
        { status: 400 }
      );
    }

    tempDir = await mkdtemp(path.join(tmpdir(), "yt-"));
    const outputTemplate = path.join(tempDir, "%(title)s.%(ext)s");

    // Get video info first
    const { stdout: infoJson } = await execFileAsync("yt-dlp", [
      "--dump-json",
      "--no-playlist",
      url,
    ]);
    const info = JSON.parse(infoJson);
    const safeTitle = info.title.replace(/[/\\?%*:|"<>]/g, "_").slice(0, 100);

    let args: string[];
    let ext: string;

    if (format === "mp3") {
      args = [
        "-x",
        "--audio-format",
        "mp3",
        "--audio-quality",
        "0",
        "-o",
        outputTemplate,
        "--no-playlist",
        url,
      ];
      ext = "mp3";
    } else {
      args = [
        "-f",
        "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "--merge-output-format",
        "mp4",
        "-o",
        outputTemplate,
        "--no-playlist",
        url,
      ];
      ext = "mp4";
    }

    await execFileAsync("yt-dlp", args, { timeout: 120000 });

    const outputPath = path.join(tempDir, `${safeTitle}.${ext}`);
    const fileBuffer = await readFile(outputPath);

    const contentType = format === "mp3" ? "audio/mpeg" : "video/mp4";
    const filename = `${safeTitle}.${ext}`;

    // Clean up
    await unlink(outputPath).catch(() => {});

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("YouTube conversion error:", error);

    const message =
      error instanceof Error ? error.message : "Erreur interne du serveur.";

    if (message.includes("yt-dlp")) {
      return NextResponse.json(
        {
          error:
            "yt-dlp n'est pas installé sur le serveur. Cette fonctionnalité nécessite yt-dlp.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la conversion. Veuillez réessayer." },
      { status: 500 }
    );
  } finally {
    if (tempDir) {
      const { rm } = await import("fs/promises");
      await rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
