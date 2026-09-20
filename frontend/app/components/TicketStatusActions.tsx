'use client';

import { useState } from 'react';
import { ApiClientError, Ticket, TicketStatus, updateTicketStatus } from '@/lib/api';
import {
  allowedStatusTransitions,
  isSupportedStatus,
  validateStatusTransition,
} from '@/lib/validation';

type TicketStatusActionsProps = {
  ticket: Ticket;
  onStatusChanged: (ticket: Ticket) => void;
};

function label(status: TicketStatus): string {
  return status.replace('_', ' ').toLowerCase().replace(/(^| )\w/g, (letter) => letter.toUpperCase());
}

export default function TicketStatusActions({ ticket, onStatusChanged }: TicketStatusActionsProps) {
  const allowedStatuses = allowedStatusTransitions(ticket.status);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function changeStatus() {
    const validationError = validateStatusTransition(ticket.status, selectedStatus);
    if (validationError || !isSupportedStatus(selectedStatus)) {
      setErrorMessage(validationError ?? 'Please select a valid status.');
      return;
    }
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
      if (error instanceof ApiClientError && error.status === 409) {
        setErrorMessage('This status change is not allowed for the current ticket state.');
      } else if (error instanceof ApiClientError && error.details.some((detail) => detail.field === 'status')) {
        setErrorMessage(error.details.find((detail) => detail.field === 'status')?.message
          ?? 'Please select a valid status.');
      } else {
        setErrorMessage('Unable to change the ticket status. Please try again.');
      }
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
        <select
          value={selectedStatus}
          onChange={(event) => {
            setSelectedStatus(event.target.value);
            setErrorMessage(event.target.value
              ? validateStatusTransition(ticket.status, event.target.value) ?? null
              : null);
          }}
          disabled={isSubmitting}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? 'status-change-error' : undefined}
        >
          <option value="">Select next status</option>
          {allowedStatuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}
        </select>
      </label>
      <button className="secondary-button" type="button" onClick={changeStatus} disabled={isSubmitting}>
        {isSubmitting ? 'Updating status...' : 'Update status'}
      </button>
      {errorMessage && <p className="field-error" id="status-change-error" role="alert">{errorMessage}</p>}
    </div>
  );
}
