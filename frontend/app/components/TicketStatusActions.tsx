'use client';

import { useState } from 'react';
import { ApiClientError, Ticket, TicketStatus, updateTicketStatus } from '@/lib/api';
import { ConfirmDialog } from '@/app/components/TicketUi';
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
  const [isConfirming, setIsConfirming] = useState(false);

  async function submitStatus(nextStatus: TicketStatus) {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const updatedTicket = await updateTicketStatus(ticket.id, nextStatus);
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

  function changeStatus() {
    const validationError = validateStatusTransition(ticket.status, selectedStatus);
    if (validationError || !isSupportedStatus(selectedStatus)) {
      setErrorMessage(validationError ?? 'Please select a valid status.');
      return;
    }
    const terminalTransition = selectedStatus === 'CLOSED' || selectedStatus === 'CANCELLED';
    if (terminalTransition) {
      setIsConfirming(true);
      return;
    }
    void submitStatus(selectedStatus);
  }

  if (allowedStatuses.length === 0) {
    return (
      <div className="status-terminal-note">
        <span aria-hidden="true">✓</span>
        <p><strong>Workflow complete</strong>This ticket is in a terminal state.</p>
      </div>
    );
  }

  return (
    <>
      <div className="status-actions">
        <label className="status-select-field">
          <span>Move ticket to</span>
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
        <button className="primary-button status-submit" type="button" onClick={changeStatus} disabled={isSubmitting || !selectedStatus}>
          {isSubmitting ? <><span className="button-spinner" aria-hidden="true" />Updating...</> : 'Update status'}
        </button>
        {errorMessage && <p className="field-error" id="status-change-error" role="alert">{errorMessage}</p>}
      </div>
      <ConfirmDialog
        isOpen={isConfirming}
        title={selectedStatus === 'CLOSED' ? 'Close ticket?' : 'Cancel ticket?'}
        description={selectedStatus === 'CLOSED'
          ? `This will move ticket #${ticket.id} to Closed. Closed tickets cannot be reopened.`
          : `This will move ticket #${ticket.id} to Cancelled. This action cannot be reversed.`}
        confirmLabel={selectedStatus === 'CLOSED' ? 'Close ticket' : 'Cancel ticket'}
        isDestructive
        onCancel={() => setIsConfirming(false)}
        onConfirm={() => {
          setIsConfirming(false);
          if (isSupportedStatus(selectedStatus)) void submitStatus(selectedStatus);
        }}
      />
    </>
  );
}
