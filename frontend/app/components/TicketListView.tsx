'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { ApiClientError, listTickets, Ticket, TicketStatus } from '@/lib/api';
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

function formatStatus(status: TicketStatus): string {
  return status.replace('_', ' ').toLowerCase().replace(/(^| )\w/g, (letter) => letter.toUpperCase());
}

function formatDate(timestamp: string): string {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' })
    .format(new Date(timestamp));
}

export default function TicketListView() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [status, setStatus] = useState<TicketStatus | ''>('');
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

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedKeyword(normalizeSearchKeyword(keyword));
  }

  function changeStatus(value: string) {
    const validationError = validateStatusFilter(value);
    if (!validationError && (value === '' || isSupportedStatus(value))) {
      setFilterError(null);
      setStatus(value);
      return;
    }
    setFilterError(validationError ?? 'Please select a valid status.');
    setStatus('');
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Support workspace</p>
          <h1>Tickets</h1>
          <p className="page-summary">Track the issues that need attention across your team.</p>
        </div>
        <Link className="primary-button" href="/tickets/new">Create ticket</Link>
      </header>

      <form className="toolbar" aria-label="Ticket list controls" onSubmit={submitSearch}>
        <label className="search-field">
          <span className="sr-only">Search tickets</span>
          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search tickets"
            disabled={isLoading}
          />
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
      </form>
      {filterError && <p className="filter-error" id="status-filter-error" role="alert">{filterError}</p>}

      <section className="ticket-panel" aria-labelledby="ticket-list-heading" aria-busy={isLoading}>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Current queue</p>
            <h2 id="ticket-list-heading">All tickets</h2>
          </div>
          <span className="count-label">{isLoading ? 'Loading' : `${tickets.length} ticket${tickets.length === 1 ? '' : 's'}`}</span>
        </div>

        {isLoading && <p className="state-panel">Loading tickets...</p>}
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
            <strong>{appliedKeyword ? 'No tickets match your search' : status ? 'No tickets found for the selected status' : 'No tickets found'}</strong>
            <p>{appliedKeyword || status ? 'Try another search or filter.' : 'Create a ticket to get started.'}</p>
          </div>
        )}
        {!isLoading && !errorMessage && tickets.length > 0 && (
          <div className="ticket-list">
            <div className="ticket-row ticket-list-header" aria-hidden="true">
              <span>Sr. No.</span>
              <span>Ticket</span>
              <span>Status</span>
              <span>Priority</span>
              <span>Assignee</span>
              <span>Date</span>
            </div>
            {tickets.map((ticket) => (
              <Link className="ticket-row" href={`/tickets/${ticket.id}`} key={ticket.id}>
                <span className="ticket-id">#{ticket.id}</span>
                <span className="ticket-title">{ticket.title}</span>
                <span className={`status-badge status-${ticket.status.toLowerCase()}`}>{formatStatus(ticket.status)}</span>
                <span className="priority-label">{ticket.priority}</span>
                <span className="assignee-label">{ticket.assignee || 'Unassigned'}</span>
                <span className="updated-label">{formatDate(ticket.updatedAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
