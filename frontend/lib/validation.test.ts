import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  normalizeSearchKeyword,
  validateComment,
  validateStatusFilter,
  validateStatusTransition,
  validateTicketField,
  validateTicketForm,
} from './validation.ts';

describe('ticket form validation', () => {
  it('preserves required and meaningful-text validation', () => {
    assert.equal(validateTicketField('title', '   '), 'Title is required.');
    assert.equal(validateTicketField('description', '1234'), 'Description must contain meaningful text.');
  });

  it('validates field limits and supported priorities', () => {
    assert.equal(validateTicketField('title', 'a'.repeat(256)), 'Title must not exceed 255 characters.');
    assert.equal(validateTicketField('assignee', 'a'.repeat(256)), 'Assignee must not exceed 255 characters.');
    assert.equal(validateTicketField('priority', ''), 'Priority is required.');
    assert.equal(validateTicketField('priority', 'URGENT'), 'Please select a valid priority.');
  });

  it('returns all invalid fields together', () => {
    assert.deepEqual(validateTicketForm({
      title: '',
      description: '',
      priority: 'URGENT',
      assignee: 'a'.repeat(256),
    }), {
      title: 'Title is required.',
      description: 'Description is required.',
      priority: 'Please select a valid priority.',
      assignee: 'Assignee must not exceed 255 characters.',
    });
  });
});

describe('comment, search, and status validation', () => {
  it('rejects blank comments and trims searches', () => {
    assert.equal(validateComment(' \n '), 'Comment content is required.');
    assert.equal(normalizeSearchKeyword('  login failure  '), 'login failure');
    assert.equal(normalizeSearchKeyword('   '), '');
  });

  it('validates status filters', () => {
    assert.equal(validateStatusFilter(''), undefined);
    assert.equal(validateStatusFilter('OPEN'), undefined);
    assert.equal(validateStatusFilter('UNKNOWN'),
      'That status filter is not supported. Showing all statuses.',
    );
  });

  it('validates required, malformed, and disallowed status changes', () => {
    assert.equal(validateStatusTransition('OPEN', ''), 'Please select a new status.');
    assert.equal(validateStatusTransition('OPEN', 'UNKNOWN'), 'Please select a valid status.');
    assert.equal(validateStatusTransition('OPEN', 'RESOLVED'),
      'This status change is not allowed for the current ticket state.',
    );
    assert.equal(validateStatusTransition('OPEN', 'IN_PROGRESS'), undefined);
  });
});
