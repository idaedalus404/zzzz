// app/api/holly/route.ts

const HOLLY_BASE = "https://hollymoviehd.cc";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
};

function buildPageUrl(slug: string): string {
  const clean = slug.replace(/^\/|\/$/g, "");
  const isEpisode = /season-\d+-episode-\d+/i.test(clean);
  return isEpisode
    ? `${HOLLY_BASE}/episode/${clean}/`
    : `${HOLLY_BASE}/${clean}/`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return Response.json(
      { error: 'Missing "slug"', usage: "?slug=frankenstein-2025" },
      { status: 400 },
    );
  }

  const pageUrl = buildPageUrl(slug);

  const pageRes = await fetch(pageUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      Cookie: `cf_clearance=x40FDvkpBAKx31rjwdoEOKYuC9ZeusNRM6tU7wut_.U-1781014595-1.2.1.1-ZXHZPFg5V.kXM2uPU1B6PNvj78Ww3jQdEKTX3RNJ28F5efM.IeTVLVx44fW.jyyp8m2MuoKvp1bk4IEzZh.aa7PGExiC_UzbGaV4WMVn5.E42TdTPdZoLoq_6WkG8qGjDBXeJV739ji3zkeeLKIOQJI0MFgmP6icGBaeRrcW9KCQzudPXHs1J4UpTXiPEQap.mzn2J5W6xgKbeT1xoSn0OqMORMpWwZQwNHM_XLa9NaIh5Gz9SldJ_wQGvMe1L_ohDFD31ro7hUvGHMXTeIEofD7F1KPrzXghzMGOhpjUapdly88e0bwvM5rkwFjz54m59tACdhrU4139WbCoxuQrtvVMNf0SML8u3Mc1eVtbnxh5V2NC7SN4SURmrEV9MBu2d3WrbrlNP6HXuWGukW3IBREDvtnWHY1awbsWNtXs9M`,
    },
  });

  if (!pageRes.ok) {
    const body = await pageRes.text();
    return Response.json(
      {
        error: `Page fetch failed: HTTP ${pageRes.status}`,
        headers: Object.fromEntries(pageRes.headers),
        body: body.slice(0, 2000),
      },
      { status: 502 },
    );
  }

  const html = await pageRes.text();
  const streamkey = (html.match(/data-streamkey="([^"]+)"/) || [])[1] || null;
  const nonce = (html.match(/data-wpnonce="([^"]+)"/) || [])[1] || null;
  const imdbid = (html.match(/data-imdbid="(tt\d+)"/) || [])[1] || null;

  return Response.json({ slug, pageUrl, streamkey, nonce, imdbid });
}
