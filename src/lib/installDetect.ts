export type InstallPlatform =
  | "ios-safari"
  | "ios-other"
  | "android-installable"
  | "android-chrome"
  | "android-samsung"
  | "android-other"
  | "desktop"
  | "unknown";

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function isAndroid(): boolean {
  if (typeof window === "undefined") return false;
  return /Android/.test(navigator.userAgent);
}

function isSafariOnIOS(): boolean {
  if (!isIOS()) return false;
  const ua = navigator.userAgent;
  const isOtherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return !isOtherBrowser;
}

function isSamsungBrowser(): boolean {
  return /SamsungBrowser/.test(navigator.userAgent);
}

function isChromeOnAndroid(): boolean {
  if (!isAndroid()) return false;
  return /Chrome/.test(navigator.userAgent) && !isSamsungBrowser();
}

export function detectInstallPlatform(
  canNativeInstall = false
): InstallPlatform {
  if (typeof window === "undefined") return "unknown";

  if (isIOS()) {
    return isSafariOnIOS() ? "ios-safari" : "ios-other";
  }

  if (isAndroid()) {
    if (canNativeInstall) return "android-installable";
    if (isSamsungBrowser()) return "android-samsung";
    if (isChromeOnAndroid()) return "android-chrome";
    return "android-other";
  }

  if (window.matchMedia("(min-width: 1024px)").matches) return "desktop";

  return "unknown";
}

export function getPlatformLabel(platform: InstallPlatform): string {
  switch (platform) {
    case "ios-safari":
      return "iPhone / iPad (Safari)";
    case "ios-other":
      return "iPhone / iPad";
    case "android-installable":
    case "android-chrome":
      return "Android (Chrome)";
    case "android-samsung":
      return "Android (Samsung Internet)";
    case "android-other":
      return "Android telefon";
    case "desktop":
      return "Računar";
    default:
      return "Vaš telefon";
  }
}
