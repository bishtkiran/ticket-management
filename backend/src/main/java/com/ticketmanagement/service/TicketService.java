package com.ticketmanagement.service;

import com.ticketmanagement.api.dto.TicketCreateRequest;
import com.ticketmanagement.api.dto.CommentCreateRequest;
import com.ticketmanagement.api.dto.CommentResponse;
import com.ticketmanagement.api.dto.TicketStatusUpdateRequest;
import com.ticketmanagement.api.dto.TicketResponse;
import com.ticketmanagement.api.dto.TicketUpdateRequest;
import java.util.List;

public interface TicketService {
    TicketResponse createTicket(TicketCreateRequest request);

    List<TicketResponse> listTickets(String keyword, String status);

    TicketResponse getTicket(Long id);

    TicketResponse updateTicket(Long id, TicketUpdateRequest request);

    TicketResponse updateTicketStatus(Long id, TicketStatusUpdateRequest request);

    CommentResponse addComment(Long ticketId, CommentCreateRequest request);
}
