package com.ticketmanagement.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketmanagement.persistence.CommentRepository;
import com.ticketmanagement.persistence.TicketRepository;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:ticket_lifecycle;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class TicketLifecycleIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private CommentRepository commentRepository;

    @BeforeEach
    void clearDatabase() {
        commentRepository.deleteAll();
        ticketRepository.deleteAll();
    }

    @Test
    void supportsCompleteTicketLifecycleEndToEnd() throws Exception {
        long ticketId = createTicket("Login failure", "Users cannot sign in");

        mockMvc.perform(get("/api/tickets/{id}", ticketId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("OPEN"))
            .andExpect(jsonPath("$.priority").value("HIGH"));

        mockMvc.perform(patch("/api/tickets/{id}", ticketId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new TicketPayload(
                    "Login failure after reset",
                    "Users cannot sign in after resetting a password",
                    "CRITICAL",
                    "identity-team"
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Login failure after reset"))
            .andExpect(jsonPath("$.priority").value("CRITICAL"))
            .andExpect(jsonPath("$.assignee").value("identity-team"));

        mockMvc.perform(post("/api/tickets/{id}/comments", ticketId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                    new CommentPayload("The identity team is investigating.")
                )))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.ticketId").value(ticketId))
            .andExpect(jsonPath("$.content").value("The identity team is investigating."));

        mockMvc.perform(get("/api/tickets/{id}/comments", ticketId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].content").value("The identity team is investigating."));

        updateStatus(ticketId, "IN_PROGRESS", "IN_PROGRESS");
        updateStatus(ticketId, "RESOLVED", "RESOLVED");
        updateStatus(ticketId, "CLOSED", "CLOSED");

        mockMvc.perform(get("/api/tickets/{id}", ticketId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("CLOSED"))
            .andExpect(jsonPath("$.closedAt").isNotEmpty())
            .andExpect(jsonPath("$.cancelledAt").isEmpty());

        mockMvc.perform(get("/api/tickets")
                .param("keyword", "password")
                .param("status", "CLOSED"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items.length()").value(1))
            .andExpect(jsonPath("$.items[0].id").value(ticketId));
    }

    @Test
    void supportsCancellationDirectlyFromOpen() throws Exception {
        long ticketId = createTicket("Export failure", "CSV exports fail");

        updateStatus(ticketId, "CANCELLED", "CANCELLED");

        mockMvc.perform(get("/api/tickets/{id}", ticketId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("CANCELLED"))
            .andExpect(jsonPath("$.cancelledAt").isNotEmpty())
            .andExpect(jsonPath("$.closedAt").isEmpty());
    }

    @Test
    void supportsCancellationFromInProgress() throws Exception {
        long ticketId = createTicket("Report timeout", "Reports take too long");

        updateStatus(ticketId, "IN_PROGRESS", "IN_PROGRESS");
        updateStatus(ticketId, "CANCELLED", "CANCELLED");

        mockMvc.perform(get("/api/tickets").param("status", "CANCELLED"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items.length()").value(1))
            .andExpect(jsonPath("$.items[0].id").value(ticketId));
    }

    @ParameterizedTest(name = "{0} -> {1} is rejected without persistence")
    @MethodSource("unsupportedTransitions")
    void rejectsEveryUnsupportedStatusTransition(String currentStatus, String requestedStatus) throws Exception {
        long ticketId = createTicket("Invalid transition case", "The current status must be preserved");
        moveTicketToStatus(ticketId, currentStatus);

        mockMvc.perform(patch("/api/tickets/{id}/status", ticketId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new StatusPayload(requestedStatus))))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.error.code").value("BUSINESS_ERROR"));

        mockMvc.perform(get("/api/tickets/{id}", ticketId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value(currentStatus));
    }

    private static Stream<Arguments> unsupportedTransitions() {
        List<String> statuses = List.of("OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "CANCELLED");
        Map<String, List<String>> allowedTransitions = Map.of(
            "OPEN", List.of("IN_PROGRESS", "CANCELLED"),
            "IN_PROGRESS", List.of("RESOLVED", "CANCELLED"),
            "RESOLVED", List.of("CLOSED"),
            "CLOSED", List.of(),
            "CANCELLED", List.of()
        );

        return statuses.stream()
            .flatMap(current -> statuses.stream()
                .filter(target -> !allowedTransitions.get(current).contains(target))
                .map(target -> Arguments.of(current, target)));
    }

    private long createTicket(String title, String description) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/tickets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new TicketPayload(
                    title,
                    description,
                    "HIGH",
                    "support-team"
                ))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("OPEN"))
            .andReturn();

        JsonNode response = objectMapper.readTree(result.getResponse().getContentAsString());
        return response.get("id").asLong();
    }

    private void updateStatus(long ticketId, String requestedStatus, String expectedStatus) throws Exception {
        mockMvc.perform(patch("/api/tickets/{id}/status", ticketId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new StatusPayload(requestedStatus))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value(expectedStatus));
    }

    private void moveTicketToStatus(long ticketId, String status) throws Exception {
        switch (status) {
            case "OPEN" -> {
            }
            case "IN_PROGRESS" -> updateStatus(ticketId, "IN_PROGRESS", "IN_PROGRESS");
            case "RESOLVED" -> {
                updateStatus(ticketId, "IN_PROGRESS", "IN_PROGRESS");
                updateStatus(ticketId, "RESOLVED", "RESOLVED");
            }
            case "CLOSED" -> {
                updateStatus(ticketId, "IN_PROGRESS", "IN_PROGRESS");
                updateStatus(ticketId, "RESOLVED", "RESOLVED");
                updateStatus(ticketId, "CLOSED", "CLOSED");
            }
            case "CANCELLED" -> updateStatus(ticketId, "CANCELLED", "CANCELLED");
            default -> throw new IllegalArgumentException("Unsupported test status: " + status);
        }
    }

    private record TicketPayload(String title, String description, String priority, String assignee) {
    }

    private record StatusPayload(String status) {
    }

    private record CommentPayload(String content) {
    }
}
