import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { MediaOption } from "./open-subtitle";
import { generateFrontendToken, FIELD_MAP } from "@/lib/token";

export interface QualityTrack {
  resolution?: number;
  format?: string;
  size?: string;
  type: "mp4" | "hls";
  link: string;
}
export interface DubTypes {
  lang: string;
  name: string;
  original: boolean;
  type: 0 | 1;
}
export interface SourceTypes {
  success: boolean;
  links: QualityTrack[];
  subtitles: MediaOption[];
  dubs?: DubTypes[];
  active?: ActiveTypes;
  fallback: boolean;
}
export interface ActiveTypes {
  langCode: string;
  langName: string;
  langType: string;
}

interface UseSourceParams {
  media_type: string;
  tmdbId: string;
  season: number;
  episode: number;
  imdbId: string | null;
  server: string;
  title: string;
  year: string;
  date: string;
  quality?: "4k" | null;
  dubCode: string;
  dubType: string;
  enable: boolean;
}

async function resolveHlsFromEmbed(embedUrl: string): Promise<string | null> {
  try {
    const res = await fetch(
      `/backend_/embed?url=${encodeURIComponent(embedUrl)}`,
    );
    const data = await res.json();
    return data.hls ?? null;
  } catch {
    return null;
  }
}
export default function useSource(
  params: UseSourceParams & { onCancel?: () => void },
) {
  const {
    media_type,
    tmdbId,
    season,
    episode,
    imdbId,
    server,
    title,
    year,
    date,
    quality,
    dubCode,
    dubType,
    enable,
  } = params;

  return useQuery<SourceTypes>({
    queryKey: [
      "get-source",
      tmdbId,
      media_type,
      season,
      episode,
      imdbId,
      server,
      title,
      year,
      quality,
      dubCode,
      dubType,
    ],
    enabled: Boolean(tmdbId && imdbId && server === server) && enable,
    retry: false,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchIntervalInBackground: false,
    queryFn: async () => {
      console.log("🚀 queryFn fired with:", {
        dubCode,
        dubType,
        server,
        tmdbId,
      });

      const { xt, rt } = generateFrontendToken(String(tmdbId));
      const backendRes = await fetchBackendToken(tmdbId, xt, rt);
      const sig = backendRes[FIELD_MAP.token];
      const ts = backendRes[FIELD_MAP.ts];

      const url = buildSourceURL({
        server,
        tmdbId,
        media_type,
        season,
        episode,
        imdbId,
        title,
        year,
        date,
        dubCode,
        dubType,
        ts,
        sig,
        xt,
      });

      const res = await axios.get(url);
      const data = res.data;

      // sentinel server returns embed_url — resolve HLS client-side
      if (data.embed_url) {
        const hls = await resolveHlsFromEmbed(data.embed_url);
        if (hls) {
          data.links = [{ type: "hls", link: hls }];
        }
      }

      await sleep(1200);
      return data;
    },
  });
}

async function fetchBackendToken(id: string, xt: string, rt: number) {
  const res = await axios.post("/backend/token", {
    [FIELD_MAP.id]: id,
    [FIELD_MAP.fToken]: xt,
    [FIELD_MAP.ts]: rt,
  });
  return res.data;
}

interface BuildSourceURLParams {
  server: string;
  tmdbId: string;
  media_type: string;
  season: number;
  episode: number;
  imdbId: string | null;
  title: string;
  year: string;
  date: string;
  ts: number;
  sig: string;
  xt: string;
  dubCode: string;
  dubType: string;
}

function buildSourceURL({
  server,
  tmdbId,
  imdbId,
  media_type,
  season,
  episode,
  title,
  year,
  ts,
  sig,
  xt,
  dubCode,
  dubType,
  date,
}: BuildSourceURLParams) {
  const params = new URLSearchParams({
    [FIELD_MAP.id]: String(tmdbId),
    b: media_type,
    [FIELD_MAP.ts]: String(ts),
    [FIELD_MAP.token]: sig,
    [FIELD_MAP.fToken]: xt,
    [FIELD_MAP.title]: title,
    [FIELD_MAP.year]: year,
    date: date,
  });

  if (media_type === "tv") {
    params.append(FIELD_MAP.season, String(season));
    params.append(FIELD_MAP.episode, String(episode));
  }
  if (!!dubCode && !!dubType) {
    params.append("dubCode", dubCode);
    params.append("dubType", dubType);
  }
  if (imdbId) {
    params.append(FIELD_MAP.imdbId, imdbId);
  }
  return `/backend_/servers/${server}?${params.toString()}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
