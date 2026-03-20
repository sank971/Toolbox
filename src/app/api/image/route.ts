import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const format = formData.get("format") as string;
    const quality = parseInt((formData.get("quality") as string) || "85", 10);

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni." },
        { status: 400 }
      );
    }

    if (!["jpeg", "png", "webp", "ico"].includes(format)) {
      return NextResponse.json(
        { error: "Format invalide." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max 50 MB)." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let outputBuffer: Buffer;
    let contentType: string;
    let ext: string;

    if (format === "ico") {
      // Generate multi-size favicon
      const sizes = [16, 32, 48];
      const pngBuffers = await Promise.all(
        sizes.map((size) =>
          sharp(buffer)
            .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toBuffer()
        )
      );

      // Build ICO file format
      outputBuffer = buildIco(pngBuffers, sizes);
      contentType = "image/x-icon";
      ext = "ico";
    } else {
      let pipeline = sharp(buffer);

      switch (format) {
        case "jpeg":
          pipeline = pipeline.jpeg({ quality, mozjpeg: true });
          contentType = "image/jpeg";
          ext = "jpg";
          break;
        case "png":
          pipeline = pipeline.png({ compressionLevel: 9 });
          contentType = "image/png";
          ext = "png";
          break;
        case "webp":
          pipeline = pipeline.webp({ quality });
          contentType = "image/webp";
          ext = "webp";
          break;
        default:
          return NextResponse.json(
            { error: "Format non supporté." },
            { status: 400 }
          );
      }

      outputBuffer = await pipeline.toBuffer();
    }

    const baseName = file.name.replace(/\.[^.]+$/, "");
    const filename = `${baseName}.${ext}`;

    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Content-Length": outputBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Image conversion error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la conversion de l'image." },
      { status: 500 }
    );
  }
}

function buildIco(pngBuffers: Buffer[], sizes: number[]): Buffer {
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * numImages;
  let dataOffset = headerSize + dirSize;

  // ICO header
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(numImages, 4); // Number of images

  // Directory entries
  const dirEntries = Buffer.alloc(dirSize);
  const offsets: number[] = [];

  for (let i = 0; i < numImages; i++) {
    const offset = i * dirEntrySize;
    const size = sizes[i] >= 256 ? 0 : sizes[i];

    dirEntries.writeUInt8(size, offset); // Width
    dirEntries.writeUInt8(size, offset + 1); // Height
    dirEntries.writeUInt8(0, offset + 2); // Color palette
    dirEntries.writeUInt8(0, offset + 3); // Reserved
    dirEntries.writeUInt16LE(1, offset + 4); // Color planes
    dirEntries.writeUInt16LE(32, offset + 6); // Bits per pixel
    dirEntries.writeUInt32LE(pngBuffers[i].length, offset + 8); // Size
    dirEntries.writeUInt32LE(dataOffset, offset + 12); // Offset

    offsets.push(dataOffset);
    dataOffset += pngBuffers[i].length;
  }

  return Buffer.concat([header, dirEntries, ...pngBuffers]);
}
