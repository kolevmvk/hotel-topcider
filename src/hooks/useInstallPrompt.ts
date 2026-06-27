"use client";

import { useCallback, useEffect, useState } from "react";
import {
  detectInstallPlatform,
  isAndroid,
  isIOS,
  isStandalone,
  type InstallPlatform,
} from "@/lib/installDetect";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function useInstallPrompt() {
  const [mounted, setMounted] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<InstallPlatform>("unknown");
  const [installing, setInstalling] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const refreshPlatform = useCallback((canInstall: boolean) => {
    setPlatform(detectInstallPlatform(canInstall));
  }, []);

  useEffect(() => {
    setMounted(true);
    setInstalled(isStandalone());
    refreshPlatform(false);

    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      refreshPlatform(true);
    }

    function handleAppInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
      setAccepted(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [refreshPlatform]);

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
        setAccepted(true);
      }
      setDeferredPrompt(null);
      refreshPlatform(false);
    } finally {
      setInstalling(false);
    }
  }

  const canNativeInstall = deferredPrompt !== null && !accepted;

  return {
    mounted,
    installed,
    platform,
    installing,
    canNativeInstall,
    isIOSDevice: isIOS(),
    isAndroidDevice: isAndroid(),
    handleInstallClick,
  };
}
