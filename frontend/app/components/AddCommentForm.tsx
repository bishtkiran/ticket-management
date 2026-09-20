'use client';

import { FormEvent, useState } from 'react';
import { addComment, ApiClientError, Comment } from '@/lib/api';
import { validateComment } from '@/lib/validation';

type AddCommentFormProps = {
  ticketId: number;
  onCommentAdded: (comment: Comment) => void;
};

export default function AddCommentForm({ ticketId, onCommentAdded }: AddCommentFormProps) {
  const [content, setContent] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedContent = content.trim();
    const validationError = validateComment(content);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    addComment(ticketId, normalizedContent)
      .then((comment) => {
        onCommentAdded(comment);
        setContent('');
      })
      .catch((error: unknown) => {
        const contentError = error instanceof ApiClientError
          ? error.details.find((detail) => detail.field === 'content')
          : undefined;
        setErrorMessage(contentError?.message ?? 'Unable to add comment. Please try again.');
      })
      .finally(() => setIsSubmitting(false));
  }

  return (
    <form className="comment-form" onSubmit={submitComment} noValidate>
      <label className="form-field">
        <span>Add comment</span>
        <textarea
          value={content}
          onChange={(event) => {
            setContent(event.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          onBlur={() => setErrorMessage(validateComment(content) ?? null)}
          rows={4}
          placeholder="Write an update for the support team"
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? 'comment-error' : undefined}
        />
      </label>
      {errorMessage && <small className="field-error" id="comment-error" role="alert">{errorMessage}</small>}
      <div className="form-actions comment-actions">
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding comment...' : 'Add comment'}
        </button>
      </div>
    </form>
  );
}
