import { Suspense } from 'react';
import TicketListView from '@/app/components/TicketListView';

export default function HomePage() {
  return (
    <Suspense fallback={<main className="app-shell"><div className="state-panel">Loading ticket workspace...</div></main>}>
      <TicketListView />
    </Suspense>
  );
}
