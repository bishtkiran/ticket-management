'use client';

import Link from 'next/link';
import { ReactNode, useEffect, useId, useRef } from 'react';
import { Comment, Ticket, TicketPriority, TicketStatus } from '@/lib/api';

export function formatStatus(status: TicketStatus): string {
  return status.replace('_', ' ').toLowerCase().replace(/(^| )\w/g, (letter) => letter.toUpperCase());
}

export function formatDate(timestamp: string, includeTime = false): string {
  return new Intl.DateTimeFormat('en', includeTime
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(timestamp));
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      <span className="badge-dot" aria-hidden="true" />
      {formatStatus(status)}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span className={`priority-badge priority-${priority.toLowerCase()}`}>
      <span aria-hidden="true" className="priority-dot" />
      {priority.toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase())}
    </span>
  );
}

export function TicketHeader({ ticket, returnPath }: { ticket: Ticket; returnPath: string }) {
  const canEdit = ticket.status !== 'CLOSED' && ticket.status !== 'CANCELLED';

  return (
    <header className="ticket-detail-header">
      <div className="ticket-heading-copy">
        <span className="ticket-key">TICKET-{ticket.id}</span>
        <h1>{ticket.title}</h1>
        <p>{ticket.description}</p>
        <div className="ticket-header-meta">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>
      <div className="ticket-header-side">
        {canEdit && (
          <Link
            className="secondary-button detail-action"
            href={`/tickets/${ticket.id}/edit?from=${encodeURIComponent(returnPath)}`}
          >
            Edit ticket
          </Link>
        )}
        <dl className="header-metadata">
          <div><dt>Priority</dt><dd>{ticket.priority.toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase())}</dd></div>
          <div><dt>Assignee</dt><dd>{ticket.assignee || 'Unassigned'}</dd></div>
          <div><dt>Created</dt><dd>{formatDate(ticket.createdAt, true)}</dd></div>
          <div><dt>Last updated</dt><dd>{formatDate(ticket.updatedAt, true)}</dd></div>
        </dl>
      </div>
    </header>
  );
}

export function MetadataItem({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="metadata-item">
      <span className="metadata-icon" aria-hidden="true">{icon}</span>
      <div>
        <dt>{label}</dt>
        <dd>{children}</dd>
      </div>
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'ST';
}

export function CommentItem({ comment }: { comment: Comment }) {
  const author = comment.createdBy || 'Support team';
  return (
    <li className="comment-item">
      <span className="avatar comment-avatar" aria-hidden="true">{initials(author)}</span>
      <article className="comment-bubble">
        <header className="comment-meta">
          <strong>{author}</strong>
          <time dateTime={comment.createdAt}>{formatDate(comment.createdAt, true)}</time>
        </header>
        <p>{comment.content}</p>
      </article>
    </li>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon" aria-hidden="true">
        <svg fill="none" viewBox="0 0 24 24">
          <path d="M5 5h14v11H9l-4 3V5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
          <path d="M9 9h6M9 12h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
        </svg>
      </span>
      <strong>{title}</strong>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, 4500);
    return () => window.clearTimeout(timeout);
  }, [onDismiss]);

  return (
    <div className="toast" role="status" aria-live="polite">
      <span aria-hidden="true">✓</span>
      <span>{message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss notification">×</button>
    </div>
  );
}

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isDestructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  isDestructive = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="confirm-dialog"
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClose={onCancel}
    >
      <span className="dialog-icon" aria-hidden="true">!</span>
      <p className="eyebrow">Please confirm</p>
      <h2 id={titleId}>{title}</h2>
      <p id={descriptionId}>{description}</p>
      <div className="dialog-actions">
        <button className="secondary-button" type="button" onClick={onCancel}>Keep ticket</button>
        <button
          className={isDestructive ? 'danger-button' : 'primary-button'}
          type="button"
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
