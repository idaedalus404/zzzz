import { NextResponse } from "next/server";

const TARGET_URL =
  "https://h5-api.aoneroom.com/wefeed-h5api-bff/subject/search";

export async function GET() {
  try {
    const upstream = await fetch(TARGET_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Referer: "https://h5.aoneroom.com/",
        Origin: "https://h5.aoneroom.com",
      },
      body: JSON.stringify({
        keyword: "the godfather",
        page: 1,
        perPage: 28,
        subjectType: 1,
      }),
    });

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Proxy request failed", detail: message },
      { status: 502 },
    );
  }
}
