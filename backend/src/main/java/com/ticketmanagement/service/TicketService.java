package com.ticketmanagement.service;

import com.ticketmanagement.api.dto.TicketCreateRequest;
import com.ticketmanagement.api.dto.TicketResponse;
import java.util.List;

public interface TicketService {
    TicketResponse createTicket(TicketCreateRequest request);

    List<TicketResponse> listTickets(String keyword, String status);

    TicketResponse getTicket(Long id);
}
