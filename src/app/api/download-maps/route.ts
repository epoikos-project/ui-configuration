import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import archiver from "archiver";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const simulationId = searchParams.get("simulationId");

  if (!simulationId) {
    return new Response(JSON.stringify({ error: "Missing simulationId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const uploadsDir = path.join(process.cwd(), "public", "maps", simulationId);

  let files: string[];
  try {
    files = await fs.readdir(uploadsDir);
  } catch {
    return new Response(JSON.stringify({ error: "Simulation not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (files.length === 0) {
    return new Response(JSON.stringify({ error: "No files found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Stream the ZIP file
  const { readable, writable } = new TransformStream();
  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.directory(uploadsDir, false);
  archive.finalize();

  const writer = writable.getWriter();

  archive.on("data", (chunk) => writer.write(chunk));
  archive.on("end", () => writer.close());
  archive.on("error", (err) => {
    console.error("Archive error:", err);
    writer.abort(err);
  });

  return new Response(readable, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="simulation_${simulationId}_maps.zip"`,
    },
  });
}
