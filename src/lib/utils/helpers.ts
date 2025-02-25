export const isVideoPage = (url: URL) => {
  return url.pathname.startsWith('/watch') || url.pathname.startsWith('/live');
};
