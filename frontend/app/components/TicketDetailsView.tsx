'use client';

import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import { ApiClientError, getTicket, listComments, Comment, Ticket } from '@/lib/api';
import AddCommentForm from '@/app/components/AddCommentForm';
import TicketStatusActions from '@/app/components/TicketStatusActions';
import {
  CommentItem,
  EmptyState,
  formatDate,
  MetadataItem,
  PriorityBadge,
  StatusBadge,
  TicketHeader,
  Toast,
} from '@/app/components/TicketUi';

function MetaIcon({ children }: { children: ReactNode }) {
  return (
    <svg fill="none" height="16" viewBox="0 0 24 24" width="16">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7">
        {children}
      </g>
    </svg>
  );
}

export default function TicketDetailsView({
  ticketId,
  returnPath = '/',
  initialNotice,
}: {
  ticketId: number;
  returnPath?: string;
  initialNotice?: string;
}) {
  const initialNoticeMessage = initialNotice === 'created'
    ? `Ticket #${ticketId} created successfully.`
    : initialNotice === 'updated'
      ? 'Ticket updated successfully.'
      : '';
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [areCommentsLoading, setAreCommentsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [retryVersion, setRetryVersion] = useState(0);
  const [notice, setNotice] = useState(initialNoticeMessage);

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
      {notice && <Toast message={notice} onDismiss={() => setNotice('')} />}
      <Link className="back-link" href={returnPath}>Back to tickets</Link>

      {isLoading && (
        <div className="detail-loading" role="status" aria-label="Loading ticket">
          <span className="skeleton skeleton-key" />
          <span className="skeleton skeleton-title" />
          <span className="skeleton skeleton-copy" />
          <div className="detail-loading-grid">
            <span className="skeleton" />
            <span className="skeleton" />
          </div>
        </div>
      )}
      {!isLoading && errorMessage && (
        <div className="state-panel error-state detail-state" role="alert">
          <span className="state-icon" aria-hidden="true">!</span>
          <strong>{isNotFound ? 'Ticket not found' : 'Unable to load ticket'}</strong>
          <p>{errorMessage}</p>
          {isNotFound ? (
            <Link className="secondary-button retry-button" href={returnPath}>Back to tickets</Link>
          ) : (
            <button className="secondary-button retry-button" type="button" onClick={() => setRetryVersion((current) => current + 1)}>
              Retry
            </button>
          )}
        </div>
      )}
      {!isLoading && !errorMessage && ticket && (
        <>
          <TicketHeader ticket={ticket} returnPath={returnPath} />

          <div className="ticket-workspace">
            <div className="ticket-primary-column">
              <section className="content-section description-section" aria-labelledby="description-heading">
                <div className="section-heading">
                  <div>
                    <span className="section-kicker">Ticket details</span>
                    <h2 id="description-heading">Description</h2>
                  </div>
                </div>
                <p className="description-copy">{ticket.description}</p>
              </section>

              <section className="content-section status-action-card" id="status-actions" aria-label="Ticket status actions">
                <div className="section-heading status-action-heading">
                  <div>
                    <span className="section-kicker">Workflow</span>
                    <h2>Change status</h2>
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>
                <TicketStatusActions
                  ticket={ticket}
                  onStatusChanged={(updatedTicket) => {
                    setTicket(updatedTicket);
                    setNotice('Ticket status updated successfully.');
                  }}
                />
              </section>

              <section className="content-section conversation-section" aria-labelledby="comments-heading">
                <div className="section-heading conversation-heading">
                  <div>
                    <span className="section-kicker">Thread</span>
                    <h2 id="comments-heading">Conversation</h2>
                  </div>
                  <span className="count-label">
                    {areCommentsLoading ? 'Loading' : `${comments.length} comment${comments.length === 1 ? '' : 's'}`}
                  </span>
                </div>

                {areCommentsLoading && (
                  <div className="comment-skeleton" role="status" aria-label="Loading comments">
                    <span /><span />
                  </div>
                )}
                {!areCommentsLoading && commentsError && (
                  <div className="inline-error-state" role="alert">
                    <p className="empty-copy error-state">{commentsError}</p>
                    <button className="secondary-button retry-button" type="button" onClick={() => setRetryVersion((current) => current + 1)}>
                      Retry comments
                    </button>
                  </div>
                )}
                {!areCommentsLoading && !commentsError && comments.length === 0 && (
                  <EmptyState
                    title="No comments yet"
                    description="Start the conversation by adding the first update to this ticket."
                  />
                )}
                {!areCommentsLoading && !commentsError && comments.length > 0 && (
                  <ol className="comments-list">
                    {comments.map((comment) => <CommentItem comment={comment} key={comment.id} />)}
                  </ol>
                )}

                <AddCommentForm
                  ticketId={ticket.id}
                  onCommentAdded={(comment) => {
                    setComments((current) => [...current, comment]);
                    setNotice('Comment added successfully.');
                  }}
                />
              </section>
            </div>

            <aside className="ticket-side-column" aria-label="Ticket information and actions">
              <section className="side-section">
                <div className="side-section-heading">
                  <h2>Ticket information</h2>
                </div>
                <dl className="metadata-list">
                  <MetadataItem
                    icon={<MetaIcon><path d="M5 5h14v14H5zM8 9h8M8 13h5" /></MetaIcon>}
                    label="Ticket ID"
                  >
                    TICKET-{ticket.id}
                  </MetadataItem>
                  <MetadataItem
                    icon={<MetaIcon><circle cx="12" cy="12" r="8" /><path d="M9 12.5 11 14l4-4" /></MetaIcon>}
                    label="Status"
                  >
                    <StatusBadge status={ticket.status} />
                  </MetadataItem>
                  <MetadataItem
                    icon={<MetaIcon><path d="M6 4v16M6 5h10l-2 3 2 3H6" /></MetaIcon>}
                    label="Priority"
                  >
                    <PriorityBadge priority={ticket.priority} />
                  </MetadataItem>
                  <MetadataItem
                    icon={<MetaIcon><circle cx="12" cy="8" r="3" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></MetaIcon>}
                    label="Assignee"
                  >
                    {ticket.assignee || 'Unassigned'}
                  </MetadataItem>
                  <MetadataItem
                    icon={<MetaIcon><rect height="15" rx="2" width="16" x="4" y="5" /><path d="M8 3v4M16 3v4M4 10h16" /></MetaIcon>}
                    label="Created"
                  >
                    {formatDate(ticket.createdAt)}
                  </MetadataItem>
                  <MetadataItem
                    icon={<MetaIcon><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></MetaIcon>}
                    label="Updated"
                  >
                    {formatDate(ticket.updatedAt)}
                  </MetadataItem>
                </dl>
              </section>

              <section className="side-section quick-actions-section" aria-labelledby="quick-actions-heading">
                <div className="side-section-heading">
                  <h2 id="quick-actions-heading">Quick actions</h2>
                </div>
                <div className="quick-actions">
                  <a href="#status-actions">
                    <MetaIcon><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></MetaIcon>
                    <span>Change status</span>
                    <span aria-hidden="true">›</span>
                  </a>
                  {ticket.status !== 'CLOSED' && ticket.status !== 'CANCELLED' && (
                    <Link href={`/tickets/${ticket.id}/edit?from=${encodeURIComponent(returnPath)}`}>
                      <MetaIcon><path d="m4 20 4.2-1 10.5-10.5-3.2-3.2L5 15.8 4 20ZM13.8 7l3.2 3.2" /></MetaIcon>
                      <span>Edit ticket</span>
                      <span aria-hidden="true">›</span>
                    </Link>
                  )}
                  <a href="#comment-composer">
                    <MetaIcon><path d="M5 5h14v11H9l-4 3V5ZM9 9h6M9 12h4" /></MetaIcon>
                    <span>Add comment</span>
                    <span aria-hidden="true">›</span>
                  </a>
                </div>
              </section>
            </aside>
          </div>
        </>
      )}
    </main>
  );
}
