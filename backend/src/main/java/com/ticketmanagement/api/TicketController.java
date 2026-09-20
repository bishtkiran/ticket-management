package com.ticketmanagement.api;

import com.ticketmanagement.api.dto.TicketCreateRequest;
import com.ticketmanagement.api.dto.CommentCreateRequest;
import com.ticketmanagement.api.dto.CommentResponse;
import com.ticketmanagement.api.dto.TicketListResponse;
import com.ticketmanagement.api.dto.TicketResponse;
import com.ticketmanagement.api.dto.TicketStatusUpdateRequest;
import com.ticketmanagement.api.dto.TicketUpdateRequest;
import com.ticketmanagement.service.TicketService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping("/tickets")
    public ResponseEntity<TicketResponse> createTicket(@Valid @RequestBody TicketCreateRequest request) {
        TicketResponse response = ticketService.createTicket(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/tickets")
    public ResponseEntity<TicketListResponse> listTickets(@RequestParam(required = false) String keyword,
                                                        @RequestParam(required = false) String status) {
        List<TicketResponse> items = ticketService.listTickets(keyword, status);
        return ResponseEntity.ok(new TicketListResponse(items, 0, items.size(), items.size()));
    }

    @GetMapping("/tickets/{id}")
    public ResponseEntity<TicketResponse> getTicket(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicket(id));
    }

    @PatchMapping("/tickets/{id}")
    public ResponseEntity<TicketResponse> updateTicket(@PathVariable Long id,
                                                     @Valid @RequestBody TicketUpdateRequest request) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request));
    }

    @PatchMapping("/tickets/{id}/status")
    public ResponseEntity<TicketResponse> updateTicketStatus(@PathVariable Long id,
                                                            @RequestBody TicketStatusUpdateRequest request) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, request));
    }

    @PostMapping("/tickets/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(@PathVariable Long id,
                                                     @Valid @RequestBody CommentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.addComment(id, request));
    }

    @GetMapping("/tickets/{id}/comments")
    public ResponseEntity<List<CommentResponse>> listComments(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.listComments(id));
    }
}
