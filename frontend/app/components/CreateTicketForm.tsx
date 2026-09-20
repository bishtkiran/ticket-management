'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClientError, createTicket, TicketPriority } from '@/lib/api';
import {
  ticketPriorities,
  TicketFormErrors,
  TicketFormField,
  validateTicketField,
  validateTicketForm,
} from '@/lib/validation';

export default function CreateTicketForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [assignee, setAssignee] = useState('');
  const [errors, setErrors] = useState<TicketFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): TicketFormErrors {
    return validateTicketForm({ title, description, priority, assignee });
  }

  function validateField(field: TicketFormField, value: string) {
    const nextError = validateTicketField(field, value);
    setErrors((current) => ({ ...current, [field]: nextError }));
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createTicket({
        title: title.trim(),
        description: description.trim(),
        priority,
        ...(assignee.trim() ? { assignee: assignee.trim() } : {}),
      });
      router.push('/');
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        const fieldErrors: TicketFormErrors = {};
        error.details.forEach((detail) => {
          if (['title', 'description', 'priority', 'assignee'].includes(detail.field)) {
            fieldErrors[detail.field as TicketFormField] = detail.message;
          }
        });
        setErrors(fieldErrors);
        setFormError('Unable to create ticket. Please check the details and try again.');
      } else {
        setFormError('Unable to create ticket. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="ticket-form" onSubmit={submitForm} noValidate>
      {formError && <p className="form-error" role="alert">{formError}</p>}

      <label className="form-field">
        <span>Title</span>
        <input value={title} onChange={(event) => setTitle(event.target.value)} onBlur={(event) => validateField('title', event.target.value)} aria-invalid={Boolean(errors.title)} />
        {errors.title && <small className="field-error">{errors.title}</small>}
      </label>

      <label className="form-field">
        <span>Description</span>
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} onBlur={(event) => validateField('description', event.target.value)} rows={6} aria-invalid={Boolean(errors.description)} />
        {errors.description && <small className="field-error">{errors.description}</small>}
      </label>

      <div className="form-grid">
        <label className="form-field">
          <span>Priority</span>
          <select
            value={priority}
            onChange={(event) => {
              setPriority(event.target.value as TicketPriority);
              validateField('priority', event.target.value);
            }}
            aria-invalid={Boolean(errors.priority)}
          >
            {ticketPriorities.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          {errors.priority && <small className="field-error">{errors.priority}</small>}
        </label>

        <label className="form-field">
          <span>Assignee <small>(optional)</small></span>
          <input value={assignee} onChange={(event) => setAssignee(event.target.value)} onBlur={(event) => validateField('assignee', event.target.value)} aria-invalid={Boolean(errors.assignee)} />
          {errors.assignee && <small className="field-error">{errors.assignee}</small>}
        </label>
      </div>

      <div className="form-actions">
        <button className="secondary-button" type="button" onClick={() => router.push('/')}>Cancel</button>
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating ticket...' : 'Create ticket'}
        </button>
      </div>
    </form>
  );
}
