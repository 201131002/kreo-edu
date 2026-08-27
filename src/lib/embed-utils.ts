export function getEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      let videoId = '';
      if (hostname.includes('youtu.be')) {
        videoId = parsed.pathname.slice(1);
      } else {
        const params = new URLSearchParams(parsed.search);
        videoId = params.get('v') || '';
      }
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (hostname.includes('vimeo.com')) {
      const videoId = parsed.pathname.slice(1);
      if (videoId) return `https://player.vimeo.com/video/${videoId}`;
    }
    return null;
  } catch {
    return null;
  }
}