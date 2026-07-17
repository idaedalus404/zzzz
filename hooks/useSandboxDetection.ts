// hooks/useSandboxDetection.ts
"use client";

import { useEffect, useState } from "react";

export function useSandboxDetection() {
  const [isEmbedded] = useState(
    () => typeof window !== "undefined" && window.self !== window.top,
  );
  const [isSandboxed, setIsSandboxed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(() => !isEmbedded);

  useEffect(() => {
    if (!isEmbedded) {
      setIsLoaded(true);
      return;
    }

    let sandboxed = false;

    try {
      document.domain = document.domain;
    } catch (err) {
      if (err instanceof DOMException && err.name === "SecurityError") {
        sandboxed = true;
      }
    }

    if (sandboxed) {
      setIsSandboxed(true);
      setIsLoaded(true);
      return;
    }

    try {
      if (navigator.plugins.namedItem("Chrome PDF Viewer")) {
        const obj = document.createElement("object");
        obj.data = "data:application/pdf;base64,aG1t";
        obj.style.display = "none";

        obj.onload = () => {
          setIsLoaded(true);
          obj.remove();
        };

        obj.onerror = () => {
          setIsSandboxed(true);
          setIsLoaded(true);
          obj.remove();
        };

        document.body.appendChild(obj);
      } else {
        setIsLoaded(true);
      }
    } catch {
      setIsLoaded(true);
    }
  }, [isEmbedded]);

  return { isSandboxed, isLoaded, isEmbedded };
}
