// Detects in-app browsers (Instagram, TikTok, FB, Messenger, LinkedIn, X, Discord, Snapchat, Line, WeChat, Pinterest)
// and generic Android/iOS WebViews. Google OAuth returns 403 disallowed_useragent in these.
export function isInAppBrowser(ua: string = navigator.userAgent): boolean {
  const s = ua.toLowerCase();

  const namedInApp = [
    "instagram",
    "fbav", "fban", "fb_iab", "fb4a", // Facebook
    "messenger",
    "tiktok", "musical_ly", "bytedance", "bytelocale",
    "linkedinapp",
    "twitter", // X / Twitter in-app
    "discord",
    "snapchat",
    "line/",
    "micromessenger", // WeChat
    "pinterest",
    "kakaotalk",
    "whatsapp",
  ];
  if (namedInApp.some((k) => s.includes(k))) return true;

  // Generic Android WebView: "wv" token in UA
  if (/android.*; wv\)/.test(s)) return true;

  // iOS in-app webview: iPhone/iPad UA without Safari token (real Safari always includes "safari/")
  const isIOS = /iphone|ipad|ipod/.test(s);
  const isSafari = s.includes("safari/");
  const isCriOSorFxiOS = /crios|fxios|edgios/.test(s); // Chrome/Firefox/Edge on iOS are fine for OAuth
  if (isIOS && !isSafari && !isCriOSorFxiOS) return true;

  return false;
}

export function getInAppBrowserName(ua: string = navigator.userAgent): string {
  const s = ua.toLowerCase();
  if (s.includes("instagram")) return "Instagram";
  if (s.includes("tiktok") || s.includes("musical_ly") || s.includes("bytedance")) return "TikTok";
  if (s.includes("messenger")) return "Messenger";
  if (s.includes("fbav") || s.includes("fban") || s.includes("fb_iab") || s.includes("fb4a")) return "Facebook";
  if (s.includes("linkedinapp")) return "LinkedIn";
  if (s.includes("twitter")) return "X";
  if (s.includes("discord")) return "Discord";
  if (s.includes("snapchat")) return "Snapchat";
  if (s.includes("micromessenger")) return "WeChat";
  if (s.includes("line/")) return "Line";
  if (s.includes("pinterest")) return "Pinterest";
  if (s.includes("kakaotalk")) return "KakaoTalk";
  if (s.includes("whatsapp")) return "WhatsApp";
  return "this app";
}
