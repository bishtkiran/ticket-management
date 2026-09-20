'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ApiClientError, getTicket, Ticket } from '@/lib/api';

function formatStatus(status: Ticket['status']): string {
  return status.replace('_', ' ').toLowerCase().replace(/(^| )\w/g, (letter) => letter.toUpperCase());
}

function formatDate(timestamp: string): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

export default function TicketDetailsView({ ticketId }: { ticketId: number }) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCurrentRequest = true;
    setIsLoading(true);
    setErrorMessage(null);

    getTicket(ticketId)
      .then((response) => {
        if (isCurrentRequest) {
          setTicket(response);
        }
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest) {
          return;
        }
        setErrorMessage(error instanceof ApiClientError && error.status === 404
          ? 'Ticket not found.'
          : 'Unable to load this ticket. Please try again.');
      })
      .finally(() => {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [ticketId]);

  return (
    <main className="app-shell detail-shell">
      <Link className="back-link" href="/">Back to tickets</Link>

      {isLoading && <p className="state-panel detail-state">Loading ticket...</p>}
      {!isLoading && errorMessage && (
        <p className="state-panel error-state detail-state" role="alert">{errorMessage}</p>
      )}
      {!isLoading && !errorMessage && ticket && (
        <>
          <header className="detail-header">
            <div>
              <p className="eyebrow">Ticket #{ticket.id}</p>
              <h1>{ticket.title}</h1>
              <p className="page-summary">{ticket.description}</p>
            </div>
            <span className={`status-badge status-${ticket.status.toLowerCase()}`}>
              {formatStatus(ticket.status)}
            </span>
            {ticket.status !== 'CLOSED' && ticket.status !== 'CANCELLED' && (
              <Link className="secondary-button detail-action" href={`/tickets/${ticket.id}/edit`}>Edit ticket</Link>
            )}
          </header>

          <section className="detail-grid" aria-label="Ticket details">
            <div className="detail-card detail-description">
              <p className="eyebrow">Description</p>
              <p>{ticket.description}</p>
            </div>
            <dl className="detail-card metadata-list">
              <div>
                <dt>Priority</dt>
                <dd>{ticket.priority}</dd>
              </div>
              <div>
                <dt>Assignee</dt>
                <dd>{ticket.assignee || 'Unassigned'}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDate(ticket.createdAt)}</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>{formatDate(ticket.updatedAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="detail-card comments-placeholder" aria-labelledby="comments-heading">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">History</p>
                <h2 id="comments-heading">Comments</h2>
              </div>
              <span className="count-label">Comments unavailable</span>
            </div>
            <p className="empty-copy">Comment history will appear here when that view is connected.</p>
          </section>
        </>
      )}
    </main>
  );
}
