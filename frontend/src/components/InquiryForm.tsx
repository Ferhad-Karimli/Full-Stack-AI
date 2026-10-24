'use client';

import { useState, type FormEvent } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { sendInquiry } from '@/lib/api';

type Status = 'idle' | 'sending' | 'success' | 'error' | 'limited';

export default function InquiryForm({
  propertySlug,
  locale,
  t,
}: {
  propertySlug: string;
  locale: Locale;
  t: Dictionary['inquiry'];
}) {
  const [status, setStatus] = useState<Status>('idle');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus('sending');

    const result = await sendInquiry({
      propertySlug,
      lang: locale,
      name: String(data.get('name') || ''),
      phone: String(data.get('phone') || ''),
      email: String(data.get('email') || ''),
      message: String(data.get('message') || ''),
    });

    if (result.ok) {
      form.reset();
      setStatus('success');
    } else {
      setStatus(result.status === 429 ? 'limited' : 'error');
    }
  }

  return (
    <form className="inquiry" onSubmit={onSubmit} noValidate={false}>
      <h2 className="inquiry__title">{t.title}</h2>
      <p className="inquiry__lead">{t.lead}</p>

      <label className="field">
        <span>{t.name}</span>
        <input name="name" required minLength={2} maxLength={120} autoComplete="name" />
      </label>
      <label className="field">
        <span>{t.phone}</span>
        <input
          name="phone"
          type="tel"
          required
          minLength={5}
          maxLength={40}
          pattern="[\d\s\+\(\)\-]+"
          autoComplete="tel"
          placeholder="+994 50 000 00 00"
        />
      </label>
      <label className="field">
        <span>{t.email}</span>
        <input name="email" type="email" maxLength={160} autoComplete="email" />
      </label>
      <label className="field">
        <span>{t.message}</span>
        <textarea name="message" rows={3} maxLength={2000} placeholder={t.messagePlaceholder} />
      </label>

      <button type="submit" className="btn btn--primary btn--block" disabled={status === 'sending'}>
        {status === 'sending' ? t.sending : t.submit}
      </button>

      <p className={`inquiry__status inquiry__status--${status}`} role="status" aria-live="polite">
        {status === 'success' && t.success}
        {status === 'error' && t.error}
        {status === 'limited' && t.rateLimited}
      </p>
    </form>
  );
}
