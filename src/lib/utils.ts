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

export interface PdfEmbedInfo {
  embedUrl: string;
  downloadUrl: string;
  isGoogleDrive: boolean;
  isDataUrl: boolean;
}

export function getPdfEmbedInfo(rawUrl: string): PdfEmbedInfo {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { embedUrl: "", downloadUrl: "", isGoogleDrive: false, isDataUrl: false };
  }

  const url = rawUrl.trim();

  // Data URL (Base64 uploaded document)
  if (url.startsWith("data:")) {
    return {
      embedUrl: url,
      downloadUrl: url,
      isGoogleDrive: false,
      isDataUrl: true,
    };
  }

  // Google Drive File Match:
  // e.g., https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // e.g., https://drive.google.com/file/d/FILE_ID/edit
  // e.g., https://drive.google.com/open?id=FILE_ID
  // e.g., https://drive.google.com/uc?id=FILE_ID
  const driveFileMatch = url.match(
    /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:.*&)?id=))([a-zA-Z0-9_-]+)/i
  );

  if (driveFileMatch && driveFileMatch[1]) {
    const fileId = driveFileMatch[1];
    return {
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      isGoogleDrive: true,
      isDataUrl: false,
    };
  }

  // Google Docs Document Match:
  const docsMatch = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/i);
  if (docsMatch && docsMatch[1]) {
    const docId = docsMatch[1];
    return {
      embedUrl: `https://docs.google.com/document/d/${docId}/preview`,
      downloadUrl: `https://docs.google.com/document/d/${docId}/export?format=pdf`,
      isGoogleDrive: true,
      isDataUrl: false,
    };
  }

  // Google Slides Presentation Match:
  const slidesMatch = url.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/i);
  if (slidesMatch && slidesMatch[1]) {
    const slideId = slidesMatch[1];
    return {
      embedUrl: `https://docs.google.com/presentation/d/${slideId}/embed`,
      downloadUrl: `https://docs.google.com/presentation/d/${slideId}/export/pdf`,
      isGoogleDrive: true,
      isDataUrl: false,
    };
  }

  // Google Sheets Match:
  const sheetsMatch = url.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/i);
  if (sheetsMatch && sheetsMatch[1]) {
    const sheetId = sheetsMatch[1];
    return {
      embedUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/preview`,
      downloadUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=pdf`,
      isGoogleDrive: true,
      isDataUrl: false,
    };
  }

  // Dropbox Direct link transform if needed
  if (url.includes("dropbox.com") && url.includes("dl=0")) {
    return {
      embedUrl: url.replace("dl=0", "raw=1"),
      downloadUrl: url.replace("dl=0", "dl=1"),
      isGoogleDrive: false,
      isDataUrl: false,
    };
  }

  return {
    embedUrl: url,
    downloadUrl: url,
    isGoogleDrive: false,
    isDataUrl: false,
  };
}
