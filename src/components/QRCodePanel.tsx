"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { APP_NAME } from "@/lib/constants";
import { AppIcon } from "@/lib/icons";

function getAppUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "";
}

export default function QRCodePanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [appUrl, setAppUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const url = getAppUrl();
    setAppUrl(url);

    if (canvasRef.current && url) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 280,
        margin: 2,
        color: {
          dark: "#0f2744",
          light: "#ffffff",
        },
      });
    }
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback ignored */
    }
  }

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "vojni-hotel-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="mx-auto max-w-md ht-panel-bordered p-8 text-center print:border-2 print:shadow-none">
      <div className="mb-2 flex items-center justify-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center border border-ht-gold/40 bg-ht-navy text-xs font-bold tracking-widest text-ht-gold-light">
          VH
        </div>
        <div className="text-left">
          <h2 className="ht-display text-xl text-ht-navy">{APP_NAME}</h2>
          <p className="text-sm text-ht-muted">Digitalni servis</p>
        </div>
      </div>

      <div className="my-6 flex justify-center">
        <div className="rounded-lg border border-ht-border-light bg-white p-4">
          <canvas ref={canvasRef} aria-label="QR kod aplikacije" />
        </div>
      </div>

      <p className="mb-2 inline-flex items-center justify-center gap-2 text-base text-ht-text">
        <AppIcon name="qr" className="h-4 w-4 text-ht-gold" />
        Skenirajte kamerom telefona
      </p>

      {appUrl && (
        <p className="mb-6 break-all text-sm text-ht-muted">{appUrl}</p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center print:hidden">
        <button type="button" onClick={handleCopy} className="ht-btn-secondary">
          {copied ? "Link kopiran!" : "Kopiraj link"}
        </button>
        <button type="button" onClick={handleDownload} className="ht-btn-primary inline-flex items-center justify-center gap-2">
          <AppIcon name="qr" className="h-4 w-4" />
          Preuzmi QR kod
        </button>
      </div>
    </div>
  );
}
