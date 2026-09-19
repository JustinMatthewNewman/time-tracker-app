import { describe, expect, it } from "vitest";
import { resolveExternalTicketLink, TICKET_ID_PLACEHOLDER } from "./externalTicketLink";

const TEMPLATE = `https://tracker.example.com/browse/${TICKET_ID_PLACEHOLDER}`;

describe("resolveExternalTicketLink", () => {
  it("substitutes the ticket number into the template", () => {
    expect(resolveExternalTicketLink(19051, null, TEMPLATE)).toBe(
      "https://tracker.example.com/browse/19051"
    );
  });

  it("prefers the ticket's own saved link over the template", () => {
    // Most specific wins: a URL saved on the ticket describes that ticket.
    expect(resolveExternalTicketLink(19051, "https://other.example.com/x", TEMPLATE)).toBe(
      "https://other.example.com/x"
    );
  });

  it("replaces every occurrence of the placeholder", () => {
    const t = `https://x.example/${TICKET_ID_PLACEHOLDER}?id=${TICKET_ID_PLACEHOLDER}`;
    expect(resolveExternalTicketLink(42, null, t)).toBe("https://x.example/42?id=42");
  });

  it("returns null when no template is configured", () => {
    expect(resolveExternalTicketLink(19051, null, null)).toBeNull();
    expect(resolveExternalTicketLink(19051, null, "")).toBeNull();
  });

  it("returns null for a template missing the placeholder", () => {
    // Otherwise every ticket would link to the same page.
    expect(resolveExternalTicketLink(19051, null, "https://tracker.example.com")).toBeNull();
  });

  it("returns null without a ticket number", () => {
    expect(resolveExternalTicketLink(null, null, TEMPLATE)).toBeNull();
    expect(resolveExternalTicketLink(undefined, null, TEMPLATE)).toBeNull();
  });

  it("rejects a javascript: URL saved on a ticket", () => {
    // Ticket rows are shared across users, so a link one account saves is
    // rendered as an anchor in another account's browser.
    expect(resolveExternalTicketLink(1, "javascript:alert(1)", TEMPLATE)).toBe(
      "https://tracker.example.com/browse/1"
    );
    expect(resolveExternalTicketLink(1, "javascript:alert(1)", null)).toBeNull();
  });

  it("rejects other non-http schemes", () => {
    for (const bad of ["data:text/html,<script>", "file:///etc/passwd", "vbscript:x"]) {
      expect(resolveExternalTicketLink(1, bad, null)).toBeNull();
    }
  });

  it("rejects a relative link, which would resolve against this app", () => {
    expect(resolveExternalTicketLink(1, "/ticket/1", null)).toBeNull();
  });

  it("rejects a template that produces a non-http URL", () => {
    expect(resolveExternalTicketLink(1, null, `javascript:x(${TICKET_ID_PLACEHOLDER})`)).toBeNull();
  });

  it("trims surrounding whitespace", () => {
    expect(resolveExternalTicketLink(1, "  https://x.example/1  ", null)).toBe("https://x.example/1");
  });
});
