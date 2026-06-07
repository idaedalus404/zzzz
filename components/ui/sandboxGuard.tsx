// components/SandboxGuard.jsx
"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";

export default function SandboxGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSandboxed, setIsSandboxed] = useState(false);

  useEffect(() => {
    const inIframe = window.self !== window.top;
    if (!inIframe) return;

    try {
      localStorage.setItem("__sb__", "1");
      localStorage.removeItem("__sb__");
    } catch (e) {
      if (e instanceof DOMException && e.name === "SecurityError") {
        setIsSandboxed(true);
      }
    }
  }, []);

  if (isSandboxed) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-8 bg-black">
        <TriangleAlert className="lg:size-13 size-10 mb-3 text-yellow-500" />
        <h1 className="lg:text-2xl text-lg font-bold  mb-3">
          {" "}
          Sandbox Detected
        </h1>
        <p className="text-muted-foreground mb-2 lg:text-base text-sm">
          This page cannot be embedded inside a sandboxed iframe.
        </p>
        <p className="text-muted-foreground lg:text-base text-sm">
          Please remove or disable the{" "}
          <code className=" text-red-500 px-1.5 py-0.5 underline font-medium">
            sandbox
          </code>{" "}
          attribute from your iframe, or contact the site owner.
        </p>
      </div>
    );
  }

  return children;
}
