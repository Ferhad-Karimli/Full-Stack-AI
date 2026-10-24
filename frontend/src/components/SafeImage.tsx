'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  src: string | null | undefined;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

/** Plain <img> that turns into a quiet placeholder if the remote image fails. */
export default function SafeImage({ src, alt, className, priority, sizes }: Props) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // A server-rendered <img> can fail before React hydrates and attaches onError.
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (!src || failed) {
    return (
      <div className={`img-fallback ${className ?? ''}`} role="img" aria-label={alt}>
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M8 22 24 9l16 13v17H8z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M20 39V28h8v11" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      sizes={sizes}
      onError={() => setFailed(true)}
    />
  );
}
