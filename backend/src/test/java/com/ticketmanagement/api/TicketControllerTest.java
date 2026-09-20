package com.ticketmanagement.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketmanagement.api.dto.TicketCreateRequest;
import com.ticketmanagement.api.dto.TicketResponse;
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
        given(ticketService.getTicket(1L)).willReturn(ticket);
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
}
