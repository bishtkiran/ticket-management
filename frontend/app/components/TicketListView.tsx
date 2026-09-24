'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ApiClientError, listTickets, Ticket, TicketStatus } from '@/lib/api';
import { PriorityBadge, StatusBadge } from '@/app/components/TicketUi';
import {
  isSupportedStatus,
  normalizeSearchKeyword,
  ticketStatuses,
  validateStatusFilter,
} from '@/lib/validation';

const statuses: Array<{ value: TicketStatus | ''; label: string }> = [
  { value: '', label: 'All statuses' },
  ...ticketStatuses.map((status) => ({
    value: status,
    label: status.replace('_', ' ').toLowerCase().replace(/(^| )\w/g, (letter) => letter.toUpperCase()),
  })),
];

function formatDate(timestamp: string): string {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' })
    .format(new Date(timestamp));
}

export default function TicketListView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialKeyword = normalizeSearchKeyword(searchParams.get('keyword') ?? '');
  const initialStatus = searchParams.get('status') ?? '';
  const safeInitialStatus = isSupportedStatus(initialStatus) ? initialStatus : '';
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [appliedKeyword, setAppliedKeyword] = useState(initialKeyword);
  const [status, setStatus] = useState<TicketStatus | ''>(safeInitialStatus);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;
    setIsLoading(true);
    setErrorMessage(null);

    const ticketRequest = listTickets({
      keyword: appliedKeyword.trim() || undefined,
      status: status || undefined,
    });
    const loadingWindow = new Promise<void>((resolve) => {
      window.setTimeout(resolve, 300);
    });

    Promise.all([ticketRequest, loadingWindow])
      .then(([response]) => {
        if (isCurrentRequest) {
          setTickets(response.items);
        }
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest) {
          return;
        }
        setErrorMessage(error instanceof ApiClientError
          ? 'Unable to load tickets. Please try again.'
          : 'The ticket service is unavailable. Please try again.');
      })
      .finally(() => {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [appliedKeyword, status, retryVersion]);

  function updateListUrl(nextKeyword: string, nextStatus: TicketStatus | '') {
    const params = new URLSearchParams();
    if (nextKeyword) params.set('keyword', nextKeyword);
    if (nextStatus) params.set('status', nextStatus);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextKeyword = normalizeSearchKeyword(keyword);
    setAppliedKeyword(nextKeyword);
    updateListUrl(nextKeyword, status);
  }

  function changeStatus(value: string) {
    const validationError = validateStatusFilter(value);
    if (!validationError && (value === '' || isSupportedStatus(value))) {
      setFilterError(null);
      setStatus(value);
      updateListUrl(appliedKeyword, value);
      return;
    }
    setFilterError(validationError ?? 'Please select a valid status.');
    setStatus('');
    updateListUrl(appliedKeyword, '');
  }

  function clearFilters() {
    setKeyword('');
    setAppliedKeyword('');
    setStatus('');
    setFilterError(null);
    router.replace(pathname, { scroll: false });
  }

  const hasActiveFilters = Boolean(appliedKeyword || status);
  const returnPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  return (
    <main className="app-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Ticket workspace</p>
          <h1>Tickets</h1>
          <p className="page-summary">Review, assign, and resolve customer requests from one place.</p>
        </div>
        <Link className="primary-button" href="/tickets/new"><span aria-hidden="true">＋</span>Create ticket</Link>
      </header>

      <form className="toolbar" aria-label="Ticket list controls" onSubmit={submitSearch}>
        <label className="search-field">
          <span className="sr-only">Search tickets</span>
          <span className="search-input">
            <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
              <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" />
              <path d="m15.5 15.5 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
            </svg>
            <input
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Search by title or description..."
              disabled={isLoading}
            />
          </span>
        </label>
        <label className="filter-field">
          <span className="sr-only">Filter by status</span>
          <select
            value={status}
            onChange={(event) => changeStatus(event.target.value)}
            disabled={isLoading}
            aria-invalid={Boolean(filterError)}
            aria-describedby={filterError ? 'status-filter-error' : undefined}
          >
            {statuses.map((option) => (
              <option key={option.value || 'all'} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <button className="secondary-button" type="submit" disabled={isLoading}>Search</button>
        {hasActiveFilters && (
          <button className="text-button" type="button" onClick={clearFilters} disabled={isLoading}>
            Clear filters
          </button>
        )}
      </form>
      {filterError && <p className="filter-error" id="status-filter-error" role="alert">{filterError}</p>}
      {hasActiveFilters && (
        <div className="active-filters" aria-label="Active filters">
          <span>Active filters:</span>
          {appliedKeyword && (
            <button aria-label={`Remove search filter ${appliedKeyword}`} type="button" onClick={() => {
              setKeyword('');
              setAppliedKeyword('');
              updateListUrl('', status);
            }}>
              Search: “{appliedKeyword}” <span aria-hidden="true">×</span>
            </button>
          )}
          {status && (
            <button aria-label={`Remove status filter ${status}`} type="button" onClick={() => changeStatus('')}>
              {statuses.find((option) => option.value === status)?.label} <span aria-hidden="true">×</span>
            </button>
          )}
        </div>
      )}

      <section className="ticket-panel" aria-labelledby="ticket-list-heading" aria-busy={isLoading}>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Current queue</p>
            <h2 id="ticket-list-heading">All tickets</h2>
          </div>
          <span className="count-label">{isLoading ? 'Loading' : `${tickets.length} ${hasActiveFilters ? 'matching ' : ''}ticket${tickets.length === 1 ? '' : 's'}`}</span>
        </div>

        {isLoading && (
          <div className="ticket-skeleton" role="status" aria-label="Loading tickets">
            {[1, 2, 3, 4].map((row) => <span key={row} />)}
          </div>
        )}
        {!isLoading && errorMessage && (
          <div className="state-panel error-state" role="alert">
            <p>{errorMessage}</p>
            <button className="secondary-button retry-button" type="button" onClick={() => setRetryVersion((current) => current + 1)}>
              Retry
            </button>
          </div>
        )}
        {!isLoading && !errorMessage && tickets.length === 0 && (
          <div className="state-panel">
            <span className="empty-icon" aria-hidden="true">{hasActiveFilters ? '⌕' : '◇'}</span>
            <strong>{appliedKeyword ? 'No tickets match your search' : status ? 'No tickets found for the selected status' : 'No tickets found'}</strong>
            <p>{hasActiveFilters ? 'Try changing your search or clearing the active filters.' : 'Create your first support ticket to get started.'}</p>
            {hasActiveFilters
              ? <button className="secondary-button empty-action" type="button" onClick={clearFilters}>Clear filters</button>
              : <Link className="primary-button empty-action" href="/tickets/new">Create ticket</Link>}
          </div>
        )}
        {!isLoading && !errorMessage && tickets.length > 0 && (
          <div className="ticket-list" role="table" aria-label="Tickets">
            <div className="ticket-row ticket-list-header" role="row">
              <span role="columnheader">Ticket ID</span>
              <span role="columnheader">Ticket</span>
              <span role="columnheader">Status</span>
              <span role="columnheader">Priority</span>
              <span role="columnheader">Assignee</span>
              <span role="columnheader">Updated</span>
              <span role="columnheader">Action</span>
            </div>
            {tickets.map((ticket) => (
              <Link
                className="ticket-row"
                href={`/tickets/${ticket.id}?from=${encodeURIComponent(returnPath)}`}
                key={ticket.id}
                role="row"
              >
                <span className="ticket-id" role="cell">TICKET-{ticket.id}</span>
                <span className="ticket-title" role="cell">{ticket.title}</span>
                <span role="cell"><StatusBadge status={ticket.status} /></span>
                <span role="cell"><PriorityBadge priority={ticket.priority} /></span>
                <span className="assignee-label" role="cell">{ticket.assignee || 'Unassigned'}</span>
                <span className="updated-label" role="cell">{formatDate(ticket.updatedAt)}</span>
                <span className="view-ticket" role="cell"><span aria-hidden="true">→</span><span className="sr-only">View ticket {ticket.id}</span></span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
