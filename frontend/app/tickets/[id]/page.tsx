import TicketDetailsView from '@/app/components/TicketDetailsView';

export default function TicketDetailsPage({ params }: { params: { id: string } }) {
  const ticketId = Number(params.id);
  return <TicketDetailsView ticketId={ticketId} />;
}