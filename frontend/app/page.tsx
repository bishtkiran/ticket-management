import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="app-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Support workspace</p>
          <h1>Tickets</h1>
          <p className="page-summary">Track the issues that need attention across your team.</p>
        </div>
        <button className="primary-button" type="button">Create ticket</button>
      </header>

      <section className="toolbar" aria-label="Ticket list controls">
        <label className="search-field">
          <span className="sr-only">Search tickets</span>
          <input type="search" placeholder="Search tickets" />
        </label>
        <label className="filter-field">
          <span className="sr-only">Filter by status</span>
          <select defaultValue="ALL">
            <option value="ALL">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>
      </section>

      <section className="ticket-panel" aria-labelledby="ticket-list-heading">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Current queue</p>
            <h2 id="ticket-list-heading">All tickets</h2>
          </div>
          <span className="count-label">1 ticket</span>
        </div>

        <div className="ticket-list">
          <Link className="ticket-row" href="/tickets/1042">
            <span className="ticket-id">#1042</span>
            <span className="ticket-title">Login failure after password reset</span>
            <span className="status-badge status-open">Open</span>
            <span className="priority-label">High</span>
            <span className="assignee-label">Ops team</span>
            <span className="updated-label">Updated today</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
