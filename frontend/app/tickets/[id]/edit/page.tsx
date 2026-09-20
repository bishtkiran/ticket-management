import Link from 'next/link';
import EditTicketForm from '@/app/components/EditTicketForm';
import { Ticket } from '@/lib/api';

async function loadTicket(id: string): Promise<Ticket | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api';
  const response = await fetch(`${baseUrl}/tickets/${id}`, { cache: 'no-store' });
  if (!response.ok) return null;
  return response.json() as Promise<Ticket>;
}

export default async function EditTicketPage({ params }: { params: { id: string } }) {
  const ticket = await loadTicket(params.id);

  return (
    <main className="app-shell detail-shell">
      <Link className="back-link" href={`/tickets/${params.id}`}>Back to ticket</Link>
      {!ticket && <p className="state-panel error-state detail-state" role="alert">Ticket not found.</p>}
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
          ) : <EditTicketForm ticket={ticket} />}
        </>
      )}
    </main>
  );
}
