"use client";

import { useMemo, useState } from "react";
import type { Key } from "react-aria-components";
import { ComboBox, Input, ListBox } from "@heroui/react";
import { useTickets, type Ticket } from "@/context/TicketsContext";

const CREATE_KEY = "__create__";

interface TicketComboBoxProps {
  ticket: Ticket | null;
  onSelect: (ticket: Ticket) => void;
  onClear: () => void;
  onRequestCreate: (ticketNumberText: string) => void;
  disabled?: boolean;
}

type ComboItem = { key: string; kind: "ticket"; ticket: Ticket } | { key: string; kind: "create" };

function ticketLabel(ticket: Ticket) {
  return ticket.ticketTitle ? `${ticket.ticketNumber} — ${ticket.ticketTitle}` : String(ticket.ticketNumber);
}

// Type a ticket number to search existing tickets (matched against number,
// office, and title). Picking an existing result links it to this entry and
// locks the Office cell to that ticket's office. If nothing matches, a
// synthetic "Create ticket" row is offered instead — picking it hands off to
// the parent table, which opens TicketDialog to collect office (required)
// and an optional title before creating the ticket and linking it.
export function TicketComboBox({ ticket, onSelect, onClear, onRequestCreate, disabled }: TicketComboBoxProps) {
  const { tickets } = useTickets();
  const [inputValue, setInputValue] = useState(ticket ? ticketLabel(ticket) : "");

  // Resync the text whenever the linked ticket changes from outside (e.g.
  // after a selection/creation commits, or the entry list refetches) —
  // done during render rather than in an effect to avoid an extra render
  // pass (see https://react.dev/learn/you-might-not-need-an-effect).
  const [syncedTicketId, setSyncedTicketId] = useState(ticket?.id ?? null);
  if ((ticket?.id ?? null) !== syncedTicketId) {
    setSyncedTicketId(ticket?.id ?? null);
    setInputValue(ticket ? ticketLabel(ticket) : "");
  }

  const query = inputValue.trim().toLowerCase();
  const filteredTickets = useMemo(() => {
    if (!query) return tickets;
    return tickets.filter(
      (t) =>
        String(t.ticketNumber).includes(query) ||
        (t.office?.toLowerCase().includes(query) ?? false) ||
        (t.ticketTitle?.toLowerCase().includes(query) ?? false)
    );
  }, [tickets, query]);

  const exactMatch = tickets.some((t) => String(t.ticketNumber) === query);

  const items: ComboItem[] = [
    ...filteredTickets.map((t) => ({ key: t.id, kind: "ticket" as const, ticket: t })),
    ...(query && !exactMatch ? [{ key: CREATE_KEY, kind: "create" as const }] : []),
  ];

  const handleSelectionChange = (key: Key | null) => {
    if (key == null) return;
    if (key === CREATE_KEY) {
      onRequestCreate(inputValue.trim());
      // The actual link only happens once the create dialog is submitted,
      // so put the input back the way it was rather than leaving the
      // "create" text sitting in the field.
      setInputValue(ticket ? ticketLabel(ticket) : "");
      return;
    }
    const found = tickets.find((t) => t.id === key);
    if (found) onSelect(found);
  };

  return (
    <ComboBox.Root
      aria-label="Ticket"
      items={items}
      selectedKey={ticket?.id ?? null}
      onSelectionChange={handleSelectionChange}
      inputValue={inputValue}
      onInputChange={(value) => {
        setInputValue(value);
        if (value.trim() === "" && ticket) onClear();
      }}
      allowsEmptyCollection
      isDisabled={disabled}
      defaultFilter={() => true}
    >
      <ComboBox.InputGroup>
        <Input placeholder="Ticket #" />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox<ComboItem>>
          {(item) =>
            item.kind === "create" ? (
              <ListBox.Item id={item.key} textValue={inputValue}>
                {`+ Create ticket "${inputValue.trim()}"`}
              </ListBox.Item>
            ) : (
              <ListBox.Item id={item.key} textValue={String(item.ticket.ticketNumber)}>
                {ticketLabel(item.ticket)}
              </ListBox.Item>
            )
          }
        </ListBox>
      </ComboBox.Popover>
    </ComboBox.Root>
  );
}

export default TicketComboBox;
