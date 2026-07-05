"use client";

import { useParams } from "next/navigation";
import { Tailspin } from "ldrs/react";
import "ldrs/react/Tailspin.css";
import { useTmdbDetails } from "@/hooks/fetch-details";
import { useSentinelEmbed } from "@/hooks/fetch-embed";
import { AnimatePresence, motion } from "framer-motion";
export default function Embed() {
  const { params } = useParams() as { params?: string[] };
  const media_type = String(params?.[0]);
  const id = String(params?.[1]);
  const season = params?.[2] ? Number(params[2]) : undefined;
  const episode = params?.[3] ? Number(params[3]) : undefined;

  const { data: details } = useTmdbDetails(media_type, id, "en-US");

  const { data: source, isLoading } = useSentinelEmbed({
    tmdbId: id,
    media_type,
    season,
    episode,
    imdbId: details?.imdb_id,
    enabled: !!details?.imdb_id,
  });

  const backdrop = details?.backdrop_paths[0] ?? null;

  return (
    <div className="relative w-full h-dvh bg-black overflow-hidden">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black"
          >
            {backdrop && (
              <img
                src={`https://image.tmdb.org/t/p/original${backdrop}`}
                alt="backdrop"
                className="object-cover opacity-30 "
              />
            )}
            <div className="absolute">
              <Tailspin size="50" stroke="7" speed="0.9" color="white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {source?.embed && (
          <motion.iframe
            key="iframe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            src={source.embed}
            className="absolute inset-0 w-full h-screen"
            frameBorder={0}
            allowFullScreen
          />
        )}
      </AnimatePresence>
    </div>
  );
}
