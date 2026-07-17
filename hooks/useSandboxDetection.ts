"use client";

import { useEffect, useState } from "react";

export function useSandboxDetection() {
  const [isSandboxed, setIsSandboxed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Not embedded = definitely not sandboxed
    if (window.self === window.top) {
      setIsLoading(false);
      return;
    }

    try {
      document.domain = document.domain;
    } catch (err) {
      if (err instanceof DOMException && err.name === "SecurityError") {
        setIsSandboxed(true);
        setIsLoading(false);
        return;
      }
    }

    // Browser doesn't support the PDF test
    if (!navigator.plugins.namedItem("Chrome PDF Viewer")) {
      setIsLoading(false);
      return;
    }

    const obj = document.createElement("object");
    obj.data = "data:application/pdf;base64,aG1t";
    obj.style.display = "none";

    obj.onload = () => {
      obj.remove();
      setIsLoading(false);
    };

    obj.onerror = () => {
      obj.remove();
      setIsSandboxed(true);
      setIsLoading(false);
    };

    document.body.appendChild(obj);

    return () => obj.remove();
  }, []);

  return {
    isSandboxed,
    isLoading,
  };
}
