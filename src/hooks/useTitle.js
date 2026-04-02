import { useEffect } from 'react';

export function useTitle(title) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} | VyomaAstroAI` : 'VyomaAstroAI — Vedic Astrology';
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}
