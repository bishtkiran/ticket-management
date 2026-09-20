'use client';

import { FormEvent, useState } from 'react';
import { addComment, ApiClientError, Comment } from '@/lib/api';

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
    if (!normalizedContent) {
      setErrorMessage('Comment content is required.');
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
        setErrorMessage(error instanceof ApiClientError
          ? 'Unable to add comment. Please try again.'
          : 'Unable to add comment. Please try again.');
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
          rows={4}
          placeholder="Write an update for the support team"
          aria-invalid={Boolean(errorMessage)}
        />
      </label>
      {errorMessage && <small className="field-error" role="alert">{errorMessage}</small>}
      <div className="form-actions comment-actions">
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding comment...' : 'Add comment'}
        </button>
      </div>
    </form>
  );
}
