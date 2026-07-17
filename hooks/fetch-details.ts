"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { TmdbDetailsResponse } from "./tmdb-types";

export function useTmdbDetails(
  mediaType: string,
  id: string,
  language: string,
  enabled = true,
) {
  return useQuery<TmdbDetailsResponse>({
    queryKey: ["tmdb-details", mediaType, id, language],
    enabled: enabled && !!mediaType && !!id,

    queryFn: async () => {
      const res = await axios.get<TmdbDetailsResponse>(
        `/backend/tmdb/details/${mediaType}/${id}`,
        {
          params: {
            language,
          },
        },
      );

      return res.data;
    },
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
