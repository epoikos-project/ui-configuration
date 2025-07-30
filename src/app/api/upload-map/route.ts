import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const simulationId = formData.get("simulationId") as string;
  const tick = formData.get("tick") as string;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadsDir = path.join(process.cwd(), "public", "maps", simulationId);
  await fs.mkdir(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, file.name);
  await fs.writeFile(filePath, buffer);

  return NextResponse.json({ message: "File uploaded", path: filePath });
}
