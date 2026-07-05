import { NextRequest, NextResponse } from "next/server";
import { isValidReferer } from "@/lib/allowed-referers";

export async function GET(req: NextRequest) {
  const referer = req.headers.get("referer") || "";
  if (!isValidReferer(referer)) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 },
    );
  }

  const embedUrl = req.nextUrl.searchParams.get("url");
  if (!embedUrl)
    return NextResponse.json(
      { success: false, error: "Missing url" },
      { status: 400 },
    );

  const clientIp =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "";

  const res = await fetch(embedUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
      Referer: "https://megacloudx.net/",
      Accept: "text/html",
      "X-Forwarded-For": clientIp,
      "X-Real-IP": clientIp,
    },
    cache: "no-store",
  });

  if (!res.ok)
    return NextResponse.json(
      { success: false, error: "Failed" },
      { status: 502 },
    );

  const html = await res.text();
  const hls = html.match(/var HLS\s*=\s*"([^"]+)"/)?.[1] ?? null;

  if (!hls)
    return NextResponse.json(
      { success: false, error: "HLS not found" },
      { status: 502 },
    );

  return NextResponse.json({ success: true, hls });
}
