import Link from 'next/link';
import CreateTicketForm from '@/app/components/CreateTicketForm';

export default function CreateTicketPage() {
  return (
    <main className="app-shell detail-shell form-page-shell">
      <Link className="back-link" href="/">Back to tickets</Link>
      <header className="detail-header create-header">
        <div>
          <p className="eyebrow">New ticket</p>
          <h1>Create a ticket</h1>
          <p className="page-summary">Capture the request clearly so the right person can start helping.</p>
        </div>
      </header>
      <CreateTicketForm />
    </main>
  );
}
