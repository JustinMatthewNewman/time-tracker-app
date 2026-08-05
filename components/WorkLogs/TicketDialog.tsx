"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Card, Button } from "@heroui/react";
import { useTickets, type Ticket } from "@/context/TicketsContext";

interface TicketDialogProps {
  isOpen: boolean;
  mode: "create" | "edit";
  // Create mode: the ticket number text the user typed that didn't match an
  // existing ticket, offered back prefilled (still editable) in the dialog.
  initialTicketNumber?: number;
  // Edit mode: the existing ticket being edited. ticketNumber is shown but
  // locked — see UpdateTicket in mutations.gql for why.
  ticket?: Ticket;
  onClose: () => void;
  onSaved: (ticket: Ticket) => void;
}

export function TicketDialog({ isOpen, mode, initialTicketNumber, ticket, onClose, onSaved }: TicketDialogProps) {
  const { createTicket, updateTicketDetails } = useTickets();

  const [ticketNumber, setTicketNumber] = useState(
    mode === "edit" ? String(ticket?.ticketNumber ?? "") : String(initialTicketNumber ?? "")
  );
  const [office, setOffice] = useState(ticket?.office ?? "");
  const [ticketTitle, setTicketTitle] = useState(ticket?.ticketTitle ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedTicketNumber = Number(ticketNumber);
    if (!Number.isInteger(parsedTicketNumber)) {
      setError("Ticket number must be a whole number");
      return;
    }
    if (!office.trim()) {
      setError("Office is required");
      return;
    }

    setLoading(true);
    try {
      const saved =
        mode === "edit"
          ? await updateTicketDetails({
              ticketNumber: parsedTicketNumber,
              office: office.trim(),
              ticketTitle: ticketTitle.trim() || undefined,
            })
          : await createTicket({
              ticketNumber: parsedTicketNumber,
              office: office.trim(),
              ticketTitle: ticketTitle.trim() || undefined,
            });
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save ticket");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    // Portalled to document.body — this dialog is triggered from deep inside
    // the Accordion tree, and HeroUI's accordion expand/collapse animation
    // puts a `transform` on an ancestor, which makes `position: fixed`
    // descendants position relative to *that* ancestor instead of the
    // viewport (a CSS quirk: transform/filter/perspective on an ancestor
    // creates a new containing block for fixed descendants). Without the
    // portal the dialog rendered clipped to the accordion row instead of
    // centered on screen, cutting off the Save/Create buttons.
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">{mode === "edit" ? "Edit Ticket" : "Create Ticket"}</h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-semibold block mb-2">Ticket Number *</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="e.g. 19620"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                className="w-full px-3 py-2 border border-default-200 rounded-lg disabled:opacity-50"
                required
                disabled={loading || mode === "edit"}
                autoFocus={mode === "create"}
              />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2">Office *</label>
              <input
                type="text"
                placeholder="e.g. PRODAppX"
                value={office}
                onChange={(e) => setOffice(e.target.value)}
                className="w-full px-3 py-2 border border-default-200 rounded-lg"
                required
                disabled={loading}
                autoFocus={mode === "edit"}
              />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2">Ticket Title</label>
              <input
                type="text"
                placeholder="Optional short description"
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
                className="w-full px-3 py-2 border border-default-200 rounded-lg"
                disabled={loading}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose} isDisabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                isDisabled={loading || !ticketNumber.trim() || !office.trim()}
              >
                {loading ? "Saving..." : mode === "edit" ? "Save Changes" : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>,
    document.body
  );
}

export default TicketDialog;
