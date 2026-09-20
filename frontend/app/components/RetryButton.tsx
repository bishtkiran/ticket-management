'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function RetryButton({ label = 'Retry' }: { label?: string }) {
  const router = useRouter();
  const [isRetrying, startTransition] = useTransition();

  return (
    <button
      className="secondary-button retry-button"
      type="button"
      disabled={isRetrying}
      onClick={() => startTransition(() => router.refresh())}
    >
      {isRetrying ? 'Retrying...' : label}
    </button>
  );
}
