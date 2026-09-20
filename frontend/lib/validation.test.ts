import { describe, expect, it } from 'vitest';
import {
  normalizeSearchKeyword,
  validateComment,
  validateStatusFilter,
  validateStatusTransition,
  validateTicketField,
  validateTicketForm,
} from '@/lib/validation';

describe('ticket form validation', () => {
  it('preserves required and meaningful-text validation', () => {
    expect(validateTicketField('title', '   ')).toBe('Title is required.');
    expect(validateTicketField('description', '1234')).toBe('Description must contain meaningful text.');
  });

  it('validates field limits and supported priorities', () => {
    expect(validateTicketField('title', 'a'.repeat(256))).toBe('Title must not exceed 255 characters.');
    expect(validateTicketField('assignee', 'a'.repeat(256))).toBe('Assignee must not exceed 255 characters.');
    expect(validateTicketField('priority', '')).toBe('Priority is required.');
    expect(validateTicketField('priority', 'URGENT')).toBe('Please select a valid priority.');
  });

  it('returns all invalid fields together', () => {
    expect(validateTicketForm({
      title: '',
      description: '',
      priority: 'URGENT',
      assignee: 'a'.repeat(256),
    })).toEqual({
      title: 'Title is required.',
      description: 'Description is required.',
      priority: 'Please select a valid priority.',
      assignee: 'Assignee must not exceed 255 characters.',
    });
  });
});

describe('comment, search, and status validation', () => {
  it('rejects blank comments and trims searches', () => {
    expect(validateComment(' \n ')).toBe('Comment content is required.');
    expect(normalizeSearchKeyword('  login failure  ')).toBe('login failure');
    expect(normalizeSearchKeyword('   ')).toBe('');
  });

  it('validates status filters', () => {
    expect(validateStatusFilter('')).toBeUndefined();
    expect(validateStatusFilter('OPEN')).toBeUndefined();
    expect(validateStatusFilter('UNKNOWN')).toBe(
      'That status filter is not supported. Showing all statuses.',
    );
  });

  it('validates required, malformed, and disallowed status changes', () => {
    expect(validateStatusTransition('OPEN', '')).toBe('Please select a new status.');
    expect(validateStatusTransition('OPEN', 'UNKNOWN')).toBe('Please select a valid status.');
    expect(validateStatusTransition('OPEN', 'RESOLVED')).toBe(
      'This status change is not allowed for the current ticket state.',
    );
    expect(validateStatusTransition('OPEN', 'IN_PROGRESS')).toBeUndefined();
  });
});
