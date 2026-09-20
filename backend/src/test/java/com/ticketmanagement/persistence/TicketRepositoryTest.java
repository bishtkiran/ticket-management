package com.ticketmanagement.persistence;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.ticketmanagement.domain.TicketPriority;
import com.ticketmanagement.domain.TicketStatus;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
class TicketRepositoryTest {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Test
    void savesTicketWithOpenStatusAndRetrievesItById() {
        TicketEntity saved = ticketRepository.saveAndFlush(ticket("Login issue", "Users cannot sign in", TicketStatus.OPEN));

        TicketEntity retrieved = ticketRepository.findById(saved.getId()).orElseThrow();

        assertNotNull(retrieved.getId());
        assertEquals(TicketStatus.OPEN, retrieved.getStatus());
        assertEquals("Login issue", retrieved.getTitle());
    }

    @Test
    void filtersTicketsByStatus() {
        ticketRepository.saveAndFlush(ticket("Open issue", "Needs work", TicketStatus.OPEN));
        ticketRepository.saveAndFlush(ticket("Resolved issue", "Already fixed", TicketStatus.RESOLVED));

        List<TicketEntity> results = ticketRepository.findByStatus(TicketStatus.OPEN);

        assertEquals(1, results.size());
        assertEquals(TicketStatus.OPEN, results.get(0).getStatus());
    }

    @Test
    void searchesTicketTitleAndDescriptionCaseInsensitively() {
        ticketRepository.saveAndFlush(ticket("Login failure", "Users cannot sign in", TicketStatus.OPEN));
        ticketRepository.saveAndFlush(ticket("Export issue", "CSV download is broken", TicketStatus.OPEN));

        List<TicketEntity> titleResults = ticketRepository.searchByKeyword("LOGIN");
        List<TicketEntity> descriptionResults = ticketRepository.searchByKeyword("csv download");

        assertEquals(1, titleResults.size());
        assertEquals("Login failure", titleResults.get(0).getTitle());
        assertEquals(1, descriptionResults.size());
        assertEquals("Export issue", descriptionResults.get(0).getTitle());
    }

    @Test
    void persistsCommentWithParentTicket() {
        TicketEntity ticket = ticketRepository.saveAndFlush(
            ticket("Commented issue", "Needs investigation", TicketStatus.OPEN));

        CommentEntity comment = commentRepository.saveAndFlush(
            new CommentEntity(ticket, "Investigating this issue", "ops-team"));

        CommentEntity retrieved = commentRepository.findById(comment.getId()).orElseThrow();

        assertNotNull(retrieved.getCreatedAt());
        assertEquals(ticket.getId(), retrieved.getTicket().getId());
        assertEquals("Investigating this issue", retrieved.getContent());
        assertTrue(retrieved.getTicket().getId() > 0);
    }

    private TicketEntity ticket(String title, String description, TicketStatus status) {
        return new TicketEntity(title, description, status, TicketPriority.HIGH, "ops-team");
    }
}
