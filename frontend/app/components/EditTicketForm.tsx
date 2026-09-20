'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClientError, Ticket, TicketPriority, updateTicket } from '@/lib/api';

type FormErrors = Partial<Record<'title' | 'description' | 'priority' | 'assignee', string>>;

const priorities: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function validateText(value: string, fieldName: string, maxLength?: number): string | undefined {
  const normalized = value.trim();
  if (!normalized) return `${fieldName} is required.`;
  if (!/[A-Za-z]/.test(normalized)) return `${fieldName} must contain meaningful text.`;
  if (maxLength && normalized.length > maxLength) return `${fieldName} must not exceed ${maxLength} characters.`;
  return undefined;
}

export default function EditTicketForm({ ticket }: { ticket: Ticket }) {
  const router = useRouter();
  const [title, setTitle] = useState(ticket.title);
  const [description, setDescription] = useState(ticket.description);
  const [priority, setPriority] = useState<TicketPriority>(ticket.priority);
  const [assignee, setAssignee] = useState(ticket.assignee ?? '');
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};
    const titleError = validateText(title, 'Title', 255);
    const descriptionError = validateText(description, 'Description');
    if (titleError) nextErrors.title = titleError;
    if (descriptionError) nextErrors.description = descriptionError;
    if (assignee.trim().length > 255) nextErrors.assignee = 'Assignee must not exceed 255 characters.';
    return nextErrors;
  }

  function validateField(field: keyof FormErrors, value: string) {
    const error = field === 'title'
      ? validateText(value, 'Title', 255)
      : field === 'description'
        ? validateText(value, 'Description')
        : field === 'assignee' && value.trim().length > 255
          ? 'Assignee must not exceed 255 characters.'
          : undefined;
    setErrors((current) => ({ ...current, [field]: error }));
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    try {
      await updateTicket(ticket.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        assignee: assignee.trim(),
      });
      router.push(`/tickets/${ticket.id}`);
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        const fieldErrors: FormErrors = {};
        error.details.forEach((detail) => {
          if (['title', 'description', 'priority', 'assignee'].includes(detail.field)) {
            fieldErrors[detail.field as keyof FormErrors] = detail.message;
          }
        });
        setErrors(fieldErrors);
      }
      setFormError('Unable to update ticket. Please check the details and try again.');
    } finally {
      setIsSaving(false);
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
          <select value={priority} onChange={(event) => setPriority(event.target.value as TicketPriority)}>
            {priorities.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="form-field">
          <span>Assignee <small>(optional)</small></span>
          <input value={assignee} onChange={(event) => setAssignee(event.target.value)} onBlur={(event) => validateField('assignee', event.target.value)} aria-invalid={Boolean(errors.assignee)} />
          {errors.assignee && <small className="field-error">{errors.assignee}</small>}
        </label>
      </div>
      <div className="form-actions">
        <button className="secondary-button" type="button" onClick={() => router.push(`/tickets/${ticket.id}`)}>Cancel</button>
        <button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Saving ticket...' : 'Save changes'}</button>
      </div>
    </form>
  );
}
