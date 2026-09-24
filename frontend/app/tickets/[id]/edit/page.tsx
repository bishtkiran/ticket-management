import Link from 'next/link';
import EditTicketForm from '@/app/components/EditTicketForm';
import RetryButton from '@/app/components/RetryButton';
import { Ticket } from '@/lib/api';

type TicketLoadResult =
  | { state: 'loaded'; ticket: Ticket }
  | { state: 'not-found' }
  | { state: 'error' };

async function loadTicket(id: string): Promise<TicketLoadResult> {
  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    return { state: 'not-found' };
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api';
    const response = await fetch(`${baseUrl}/tickets/${id}`, { cache: 'no-store' });
    if (response.status === 404) return { state: 'not-found' };
    if (!response.ok) return { state: 'error' };
    return { state: 'loaded', ticket: await response.json() as Ticket };
  } catch {
    return { state: 'error' };
  }
}

export default async function EditTicketPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { from?: string };
}) {
  const result = await loadTicket(params.id);
  const ticket = result.state === 'loaded' ? result.ticket : null;
  const returnPath = searchParams.from?.startsWith('/') && !searchParams.from.startsWith('//')
    ? searchParams.from
    : '/';
  const detailPath = `/tickets/${params.id}?from=${encodeURIComponent(returnPath)}`;

  return (
    <main className="app-shell detail-shell form-page-shell">
      <Link className="back-link" href={detailPath}>Back to ticket</Link>
      {result.state === 'not-found' && (
        <p className="state-panel error-state detail-state" role="alert">Ticket not found.</p>
      )}
      {result.state === 'error' && (
        <div className="state-panel error-state detail-state" role="alert">
          <p>Unable to load this ticket. Please try again.</p>
          <RetryButton />
        </div>
      )}
      {ticket && (
        <>
          <header className="detail-header create-header">
            <div>
              <p className="eyebrow">Ticket #{ticket.id}</p>
              <h1>Edit ticket</h1>
              <p className="page-summary">Update the ticket details while preserving its current lifecycle state.</p>
            </div>
          </header>
          {ticket.status === 'CLOSED' || ticket.status === 'CANCELLED' ? (
            <p className="state-panel">Terminal tickets are read-only and cannot be edited.</p>
          ) : <EditTicketForm ticket={ticket} returnPath={returnPath} />}
        </>
      )}
    </main>
  );
}
