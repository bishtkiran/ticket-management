package com.ticketmanagement.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class TicketTest {

    @Test
    void newTicketStartsOpenAndKeepsRequiredMetadata() {
        Ticket ticket = Ticket.create("Login issue", "Users cannot sign in", TicketPriority.HIGH, "ops-team");

        assertNotNull(ticket.getId());
        assertEquals("Login issue", ticket.getTitle());
        assertEquals("Users cannot sign in", ticket.getDescription());
        assertEquals(TicketStatus.OPEN, ticket.getStatus());
        assertEquals(TicketPriority.HIGH, ticket.getPriority());
        assertEquals("ops-team", ticket.getAssignee());
        assertNotNull(ticket.getCreatedAt());
        assertNotNull(ticket.getUpdatedAt());
    }

    @Test
    void validStateTransitionsAdvanceTheLifecycle() {
        Ticket ticket = Ticket.create("Login issue", "Users cannot sign in", TicketPriority.HIGH, "ops-team");

        ticket.changeStatus(TicketStatus.IN_PROGRESS);
        ticket.changeStatus(TicketStatus.RESOLVED);
        ticket.changeStatus(TicketStatus.CLOSED);

        assertEquals(TicketStatus.CLOSED, ticket.getStatus());
        assertNotNull(ticket.getClosedAt());
    }

    @Test
    void invalidStateTransitionsAreRejected() {
        Ticket ticket = Ticket.create("Login issue", "Users cannot sign in", TicketPriority.HIGH, "ops-team");

        assertThrows(IllegalStateException.class, () -> ticket.changeStatus(TicketStatus.RESOLVED));
        assertThrows(IllegalStateException.class, () -> ticket.changeStatus(TicketStatus.CLOSED));
    }
}
