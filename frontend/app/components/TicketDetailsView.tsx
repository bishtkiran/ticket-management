'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ApiClientError, getTicket, listComments, Comment, Ticket } from '@/lib/api';
import AddCommentForm from '@/app/components/AddCommentForm';
import TicketStatusActions from '@/app/components/TicketStatusActions';

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
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [areCommentsLoading, setAreCommentsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [retryVersion, setRetryVersion] = useState(0);

  useEffect(() => {
    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      setIsLoading(false);
      setAreCommentsLoading(false);
      setIsNotFound(true);
      setErrorMessage('Ticket not found.');
      return;
    }

    let isCurrentRequest = true;
    setIsLoading(true);
    setErrorMessage(null);
    setIsNotFound(false);
    setAreCommentsLoading(true);
    setCommentsError(null);

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
        const notFound = error instanceof ApiClientError && error.status === 404;
        setIsNotFound(notFound);
        setErrorMessage(notFound ? 'Ticket not found.' : 'Unable to load this ticket. Please try again.');
      })
      .finally(() => {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      });

    listComments(ticketId)
      .then((response) => {
        if (isCurrentRequest) {
          setComments(response);
        }
      })
      .catch(() => {
        if (isCurrentRequest) {
          setCommentsError('Unable to load comments. Please try again.');
        }
      })
      .finally(() => {
        if (isCurrentRequest) {
          setAreCommentsLoading(false);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [ticketId, retryVersion]);

  return (
    <main className="app-shell detail-shell">
      <Link className="back-link" href="/">Back to tickets</Link>

      {isLoading && <p className="state-panel detail-state">Loading ticket...</p>}
      {!isLoading && errorMessage && (
        <div className="state-panel error-state detail-state" role="alert">
          <p>{errorMessage}</p>
          {!isNotFound && (
            <button className="secondary-button retry-button" type="button" onClick={() => setRetryVersion((current) => current + 1)}>
              Retry
            </button>
          )}
        </div>
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

          <section className="detail-card status-card" aria-label="Ticket status actions">
            <TicketStatusActions ticket={ticket} onStatusChanged={setTicket} />
          </section>

          <section className="detail-card comments-placeholder" aria-labelledby="comments-heading">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">History</p>
                <h2 id="comments-heading">Comments</h2>
              </div>
              <span className="count-label">{areCommentsLoading ? 'Loading' : `${comments.length} comment${comments.length === 1 ? '' : 's'}`}</span>
            </div>
            {areCommentsLoading && <p className="empty-copy">Loading comments...</p>}
            {!areCommentsLoading && commentsError && (
              <div className="inline-error-state" role="alert">
                <p className="empty-copy error-state">{commentsError}</p>
                <button className="secondary-button retry-button" type="button" onClick={() => setRetryVersion((current) => current + 1)}>
                  Retry comments
                </button>
              </div>
            )}
            {!areCommentsLoading && !commentsError && comments.length === 0 && (
              <p className="empty-copy">No comments yet.</p>
            )}
            {!areCommentsLoading && !commentsError && comments.length > 0 && (
              <ol className="comments-list">
                {comments.map((comment) => (
                  <li className="comment-item" key={comment.id}>
                    <div className="comment-meta">
                      <strong>{comment.createdBy || 'Support team'}</strong>
                      <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
                    </div>
                    <p>{comment.content}</p>
                  </li>
                ))}
              </ol>
            )}
            <AddCommentForm
              ticketId={ticket.id}
              onCommentAdded={(comment) => setComments((current) => [...current, comment])}
            />
          </section>
        </>
      )}
    </main>
  );
}
