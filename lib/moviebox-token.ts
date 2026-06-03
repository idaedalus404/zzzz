// lib/moviebox-token.ts
let cachedToken: { token: string; exp: number } | null = null;

export async function getMovieBoxToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp - now > 300) {
    return cachedToken.token;
  }

  // Guest registration/login — check your network tab for this endpoint
  const res = await fetch(
    "https://h5-api.aoneroom.com/wefeed-h5api-bff/user/guest",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://moviebox.pk",
        Referer: "https://moviebox.pk/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: JSON.stringify({
        deviceId: crypto.randomUUID().replace(/-/g, ""),
        deviceType: 3, // web
      }),
    },
  );

  const json = await res.json();
  const token = json?.data?.token || json?.data?.accessToken;
  if (!token) throw new Error("Failed to get MovieBox token");

  // Decode exp from JWT payload
  const payload = JSON.parse(atob(token.split(".")[1]));
  cachedToken = { token, exp: payload.exp };
  return token;
}
