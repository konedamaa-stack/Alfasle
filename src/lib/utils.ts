import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return dateString;
  }
}

export interface VideoEmbedInfo {
  type: "youtube" | "vimeo" | "dailymotion" | "direct" | "iframe";
  embedUrl: string;
  isIframe: boolean;
}

export function getVideoEmbedInfo(rawUrl: string): VideoEmbedInfo {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { type: "direct", embedUrl: "", isIframe: false };
  }
  const url = rawUrl.trim();

  // YouTube formats:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://www.youtube.com/shorts/VIDEO_ID
  const youtubeMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
  );
  if (youtubeMatch && youtubeMatch[1]) {
    const videoId = youtubeMatch[1];
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`,
      isIframe: true,
    };
  }

  // Vimeo formats:
  const vimeoMatch = url.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      isIframe: true,
    };
  }

  // Dailymotion formats:
  const dailyMatch = url.match(/(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/i);
  if (dailyMatch && dailyMatch[1]) {
    return {
      type: "dailymotion",
      embedUrl: `https://www.dailymotion.com/embed/video/${dailyMatch[1]}`,
      isIframe: true,
    };
  }

  // Already an embed or iframe URL
  if (url.includes("/embed/") || url.includes("player.")) {
    return {
      type: "iframe",
      embedUrl: url,
      isIframe: true,
    };
  }

  // Default direct streaming video (MP4, WebM, etc.)
  return {
    type: "direct",
    embedUrl: url,
    isIframe: false,
  };
}
