import type { TicketPriority, TicketStatus } from '@/lib/api';

export const ticketPriorities: readonly TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
export const ticketStatuses: readonly TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED'];

export type TicketFormField = 'title' | 'description' | 'priority' | 'assignee';
export type TicketFormErrors = Partial<Record<TicketFormField, string>>;

const supportedPriorities = new Set<string>(ticketPriorities);
const supportedStatuses = new Set<string>(ticketStatuses);

const statusTransitions: Record<TicketStatus, readonly TicketStatus[]> = {
  OPEN: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['RESOLVED', 'CANCELLED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
  CANCELLED: [],
};

export function validateRequiredText(
  value: string,
  fieldName: string,
  maxLength?: number,
): string | undefined {
  const normalized = value.trim();
  if (!normalized) {
    return `${fieldName} is required.`;
  }
  if (!/[A-Za-z]/.test(normalized)) {
    return `${fieldName} must contain meaningful text.`;
  }
  if (maxLength && normalized.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters.`;
  }
  return undefined;
}

export function validateTicketField(field: TicketFormField, value: string): string | undefined {
  if (field === 'title') {
    return validateRequiredText(value, 'Title', 255);
  }
  if (field === 'description') {
    return validateRequiredText(value, 'Description');
  }
  if (field === 'priority') {
    if (!value.trim()) {
      return 'Priority is required.';
    }
    if (!supportedPriorities.has(value)) {
      return 'Please select a valid priority.';
    }
  }
  if (field === 'assignee' && value.trim().length > 255) {
    return 'Assignee must not exceed 255 characters.';
  }
  return undefined;
}

export function validateTicketForm(values: Record<TicketFormField, string>): TicketFormErrors {
  return (Object.keys(values) as TicketFormField[]).reduce<TicketFormErrors>((errors, field) => {
    const error = validateTicketField(field, values[field]);
    if (error) {
      errors[field] = error;
    }
    return errors;
  }, {});
}

export function validateComment(content: string): string | undefined {
  return content.trim() ? undefined : 'Comment content is required.';
}

export function normalizeSearchKeyword(keyword: string): string {
  return keyword.trim();
}

export function isSupportedStatus(value: string): value is TicketStatus {
  return supportedStatuses.has(value);
}

export function validateStatusFilter(value: string): string | undefined {
  return value === '' || isSupportedStatus(value)
    ? undefined
    : 'That status filter is not supported. Showing all statuses.';
}

export function allowedStatusTransitions(status: TicketStatus): readonly TicketStatus[] {
  return statusTransitions[status];
}

export function validateStatusTransition(currentStatus: TicketStatus, nextStatus: string): string | undefined {
  if (!nextStatus) {
    return 'Please select a new status.';
  }
  if (!isSupportedStatus(nextStatus)) {
    return 'Please select a valid status.';
  }
  if (!statusTransitions[currentStatus].includes(nextStatus)) {
    return 'This status change is not allowed for the current ticket state.';
  }
  return undefined;
}
