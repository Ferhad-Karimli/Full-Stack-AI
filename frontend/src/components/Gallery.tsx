'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import SafeImage from './SafeImage';

interface Props {
  images: string[];
  title: string;
  labels: { photo: string; allPhotos: string; close: string; prev: string; next: string };
}

const fill = (tpl: string, n: number) => tpl.replace('{n}', String(n));

/** One large photo + two smaller ones; clicking opens a full-screen viewer. */
export default function Gallery({ images, title, labels }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };

  const step = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + images.length) % images.length),
    [images.length]
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (!dialog.open) return;
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  if (images.length === 0) return <SafeImage src={null} alt={title} className="gallery__single" />;

  const visible = images.slice(0, 3);

  return (
    <>
      <div className={`gallery gallery--${visible.length}`}>
        {visible.map((src, i) => (
          <button
            key={src + i}
            type="button"
            className={`gallery__item gallery__item--${i}`}
            onClick={() => open(i)}
            aria-label={fill(labels.photo, i + 1)}
          >
            <SafeImage src={src} alt={`${title} — ${fill(labels.photo, i + 1)}`} priority={i === 0} />
          </button>
        ))}
        {images.length > 1 && (
          <button type="button" className="gallery__all btn btn--light" onClick={() => open(0)}>
            {fill(labels.allPhotos, images.length)}
          </button>
        )}
      </div>

      <dialog ref={dialogRef} className="viewer" aria-label={title} onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}>
        <div className="viewer__frame">
          <SafeImage src={images[index]} alt={`${title} — ${fill(labels.photo, index + 1)}`} className="viewer__img" />
        </div>
        <div className="viewer__bar">
          <span className="viewer__count" aria-live="polite">
            {index + 1} / {images.length}
          </span>
          <div className="viewer__actions">
            <button type="button" className="btn btn--ghost-light" onClick={() => step(-1)}>
              {labels.prev}
            </button>
            <button type="button" className="btn btn--ghost-light" onClick={() => step(1)}>
              {labels.next}
            </button>
            <button type="button" className="btn btn--light" onClick={() => dialogRef.current?.close()}>
              {labels.close}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
