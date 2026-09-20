'use client';

import { useState } from 'react';
import { ApiClientError, Ticket, TicketStatus, updateTicketStatus } from '@/lib/api';

type TicketStatusActionsProps = {
  ticket: Ticket;
  onStatusChanged: (ticket: Ticket) => void;
};

const transitions: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['RESOLVED', 'CANCELLED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
  CANCELLED: [],
};

function label(status: TicketStatus): string {
  return status.replace('_', ' ').toLowerCase().replace(/(^| )\w/g, (letter) => letter.toUpperCase());
}

export default function TicketStatusActions({ ticket, onStatusChanged }: TicketStatusActionsProps) {
  const allowedStatuses = transitions[ticket.status];
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | ''>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function changeStatus() {
    if (!selectedStatus) return;
    const terminalTransition = selectedStatus === 'CLOSED' || selectedStatus === 'CANCELLED';
    if (terminalTransition && !window.confirm(`Move this ticket to ${label(selectedStatus)}? This is a terminal state.`)) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const updatedTicket = await updateTicketStatus(ticket.id, selectedStatus);
      onStatusChanged(updatedTicket);
      setSelectedStatus('');
    } catch (error: unknown) {
      setErrorMessage(error instanceof ApiClientError && error.status === 409
        ? 'This status change is not allowed for the current ticket state.'
        : 'Unable to change the ticket status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (allowedStatuses.length === 0) {
    return <p className="status-terminal-note">This ticket is in a terminal state.</p>;
  }

  return (
    <div className="status-actions">
      <label className="form-field">
        <span>Change status</span>
        <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as TicketStatus | '')} disabled={isSubmitting}>
          <option value="">Select next status</option>
          {allowedStatuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}
        </select>
      </label>
      <button className="secondary-button" type="button" onClick={changeStatus} disabled={!selectedStatus || isSubmitting}>
        {isSubmitting ? 'Updating status...' : 'Update status'}
      </button>
      {errorMessage && <p className="field-error" role="alert">{errorMessage}</p>}
    </div>
  );
}
