package com.ticketmanagement.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketmanagement.api.dto.CommentCreateRequest;
import com.ticketmanagement.api.dto.CommentResponse;
import com.ticketmanagement.api.dto.TicketCreateRequest;
import com.ticketmanagement.api.dto.TicketResponse;
import com.ticketmanagement.api.dto.TicketStatusUpdateRequest;
import com.ticketmanagement.api.dto.TicketUpdateRequest;
import com.ticketmanagement.service.TicketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;

@WebMvcTest(TicketController.class)
class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TicketService ticketService;

    @BeforeEach
    void setUp() {
        TicketResponse ticket = new TicketResponse(
            1L,
            "Login issue",
            "Users cannot sign in",
            "OPEN",
            "HIGH",
            "ops-team",
            Instant.now(),
            Instant.now(),
            null,
            null
        );

        given(ticketService.createTicket(any(TicketCreateRequest.class))).willReturn(ticket);
        given(ticketService.listTickets(null, null)).willReturn(List.of(ticket));
        given(ticketService.listTickets("login", null)).willReturn(List.of(ticket));
        given(ticketService.listTickets(null, "OPEN")).willReturn(List.of(ticket));
        given(ticketService.getTicket(1L)).willReturn(ticket);
        given(ticketService.updateTicket(eq(1L), any(TicketUpdateRequest.class))).willReturn(ticket);
        given(ticketService.updateTicketStatus(eq(1L), any(TicketStatusUpdateRequest.class))).willReturn(ticket);
        given(ticketService.addComment(eq(1L), any(CommentCreateRequest.class)))
            .willReturn(new CommentResponse(1L, 1L, "Investigating the issue", Instant.now(), null));
    }

    @Test
    void createTicketReturnsCreatedResource() throws Exception {
        TicketCreateRequest request = new TicketCreateRequest();
        request.setTitle("Login issue");
        request.setDescription("Users cannot sign in");
        request.setPriority("HIGH");
        request.setAssignee("ops-team");

        mockMvc.perform(post("/api/tickets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.title").value("Login issue"))
            .andExpect(jsonPath("$.status").value("OPEN"));
    }

    @Test
    void listTicketsReturnsTicketCollection() throws Exception {
        mockMvc.perform(get("/api/tickets"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items[0].title").value("Login issue"));
    }

    @Test
    void getTicketByIdReturnsTicketDetails() throws Exception {
        mockMvc.perform(get("/api/tickets/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void updateTicketReturnsUpdatedResource() throws Exception {
        TicketUpdateRequest request = new TicketUpdateRequest();
        request.setTitle("Updated login issue");
        request.setDescription("Updated description");
        request.setPriority("MEDIUM");
        request.setAssignee("bob@example.com");

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/tickets/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Login issue"));
    }

    @Test
    void updateStatusReturnsUpdatedResource() throws Exception {
        TicketStatusUpdateRequest request = new TicketStatusUpdateRequest();
        request.setStatus("IN_PROGRESS");

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/tickets/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("OPEN"));
    }

    @Test
    void addCommentReturnsCreatedComment() throws Exception {
        CommentCreateRequest request = new CommentCreateRequest();
        request.setContent("Investigating the issue");

        mockMvc.perform(post("/api/tickets/1/comments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.ticketId").value(1))
            .andExpect(jsonPath("$.content").value("Investigating the issue"));
    }

    @Test
    void searchTicketsReturnsMatchingCollection() throws Exception {
        mockMvc.perform(get("/api/tickets").param("keyword", "login"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items[0].title").value("Login issue"));
    }

    @Test
    void filterTicketsByStatusReturnsMatchingCollection() throws Exception {
        mockMvc.perform(get("/api/tickets").param("status", "OPEN"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items[0].status").value("OPEN"));
    }
}
