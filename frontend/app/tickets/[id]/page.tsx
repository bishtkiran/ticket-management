import Link from 'next/link';

export default function TicketDetailsPage({ params }: { params: { id: string } }) {
  return (
    <main className="app-shell detail-shell">
      <Link className="back-link" href="/">Back to tickets</Link>

      <header className="detail-header">
        <div>
          <p className="eyebrow">Ticket #{params.id}</p>
          <h1>Login failure after password reset</h1>
          <p className="page-summary">Users cannot sign in after resetting their credentials.</p>
        </div>
        <span className="status-badge status-open">Open</span>
      </header>

      <section className="detail-grid" aria-label="Ticket details">
        <div className="detail-card detail-description">
          <p className="eyebrow">Description</p>
          <p>Users receive an invalid credentials message after completing the password reset flow.</p>
        </div>
        <dl className="detail-card metadata-list">
          <div>
            <dt>Priority</dt>
            <dd>High</dd>
          </div>
          <div>
            <dt>Assignee</dt>
            <dd>Ops team</dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>Today, 09:42</dd>
          </div>
          <div>
            <dt>Last updated</dt>
            <dd>Today, 10:18</dd>
          </div>
        </dl>
      </section>

      <section className="detail-card comments-placeholder" aria-labelledby="comments-heading">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">History</p>
            <h2 id="comments-heading">Comments</h2>
          </div>
          <span className="count-label">No comments</span>
        </div>
        <p className="empty-copy">Updates and discussion will appear here.</p>
      </section>
    </main>
  );
}