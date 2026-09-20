package com.ticketmanagement.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.ticketmanagement.api.dto.TicketResponse;
import com.ticketmanagement.api.dto.TicketStatusUpdateRequest;
import com.ticketmanagement.persistence.CommentRepository;
import com.ticketmanagement.persistence.TicketEntity;
import com.ticketmanagement.persistence.TicketRepository;
import com.ticketmanagement.domain.TicketPriority;
import com.ticketmanagement.domain.TicketStatus;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class TicketServiceImplTest {

    private final TicketRepository ticketRepository = org.mockito.Mockito.mock(TicketRepository.class);
    private final CommentRepository commentRepository = org.mockito.Mockito.mock(CommentRepository.class);
    private final TicketServiceImpl ticketService = new TicketServiceImpl(ticketRepository, commentRepository);

    @Test
    void invalidTransitionIsRejectedBeforePersistence() {
        TicketEntity ticket = ticket(TicketStatus.OPEN);
        given(ticketRepository.findById(1L)).willReturn(Optional.of(ticket));

        TicketStatusUpdateRequest request = new TicketStatusUpdateRequest();
        request.setStatus("CLOSED");

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
            () -> ticketService.updateTicketStatus(1L, request));

        assertEquals(409, exception.getStatusCode().value());
        assertEquals(TicketStatus.OPEN, ticket.getStatus());
        verify(ticketRepository, never()).save(any(TicketEntity.class));
    }

    @Test
    void validTransitionIsPersistedAndReturned() {
        TicketEntity ticket = ticket(TicketStatus.OPEN);
        given(ticketRepository.findById(1L)).willReturn(Optional.of(ticket));
        given(ticketRepository.save(ticket)).willReturn(ticket);

        TicketStatusUpdateRequest request = new TicketStatusUpdateRequest();
        request.setStatus("IN_PROGRESS");

        TicketResponse response = ticketService.updateTicketStatus(1L, request);

        assertEquals(TicketStatus.IN_PROGRESS, ticket.getStatus());
        assertEquals("IN_PROGRESS", response.getStatus());
        verify(ticketRepository).save(ticket);
    }

    private TicketEntity ticket(TicketStatus status) {
        TicketEntity ticket = new TicketEntity(
            "Login issue",
            "Users cannot sign in",
            status,
            TicketPriority.HIGH,
            "ops-team"
        );
        return ticket;
    }
}
