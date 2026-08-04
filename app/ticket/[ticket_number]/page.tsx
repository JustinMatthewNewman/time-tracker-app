import TicketPage from "@/components/Ticket/TicketPage";

interface PageProps {
  params: Promise<{ ticket_number: string }>;
}

export default async function Ticket({ params }: PageProps) {
  const { ticket_number } = await params;
  return <TicketPage ticketNumberParam={ticket_number} />;
}
