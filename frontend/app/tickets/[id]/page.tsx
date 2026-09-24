import TicketDetailsView from '@/app/components/TicketDetailsView';

export default function TicketDetailsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { from?: string; notice?: string };
}) {
  const ticketId = Number(params.id);
  const returnPath = searchParams.from?.startsWith('/') && !searchParams.from.startsWith('//')
    ? searchParams.from
    : '/';
  return <TicketDetailsView ticketId={ticketId} returnPath={returnPath} initialNotice={searchParams.notice} />;
}