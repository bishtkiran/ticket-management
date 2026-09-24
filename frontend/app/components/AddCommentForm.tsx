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
    <form className="comment-form comment-composer" id="comment-composer" onSubmit={submitComment} noValidate>
      <div className="composer-heading">
        <span className="avatar avatar-small" aria-hidden="true">ST</span>
        <div>
          <strong>Add a comment</strong>
          <span>Share an update with the support team</span>
        </div>
      </div>
      <div className="composer-surface">
        <label>
          <span className="sr-only">Comment</span>
        <textarea
          value={content}
          onChange={(event) => {
            setContent(event.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          onBlur={() => setErrorMessage(validateComment(content) ?? null)}
          rows={3}
          placeholder="Write an update for the support team..."
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? 'comment-error' : undefined}
        />
        </label>
        {errorMessage && <small className="field-error composer-error" id="comment-error" role="alert">{errorMessage}</small>}
        <div className="composer-toolbar">
          <div className="composer-tools" aria-label="Comment tools">
            <button aria-label="Attach file (not available)" disabled title="Attachments are not available yet" type="button">
              <svg fill="none" viewBox="0 0 24 24"><path d="m8 12.5 5.8-5.8a3 3 0 0 1 4.2 4.2l-7.7 7.7a5 5 0 0 1-7.1-7.1l7.3-7.3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></svg>
            </button>
            <button aria-label="Mention teammate (not available)" disabled title="Mentions are not available yet" type="button">@</button>
            <button aria-label="Add emoji (not available)" disabled title="Emoji picker is not available yet" type="button">☺</button>
          </div>
          <button className="primary-button comment-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <><span className="button-spinner" aria-hidden="true" />Commenting...</> : 'Comment'}
          </button>
        </div>
      </div>
    </form>
  );
}
