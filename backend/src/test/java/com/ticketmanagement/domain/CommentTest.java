package com.ticketmanagement.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class CommentTest {

    @Test
    void commentCreatedForTicketHasRequiredMetadata() {
        Comment comment = Comment.create(1L, "Investigating the login error", "support-user");

        assertNotNull(comment.getId());
        assertEquals(1L, comment.getTicketId());
        assertEquals("Investigating the login error", comment.getContent());
        assertEquals("support-user", comment.getCreatedBy());
        assertNotNull(comment.getCreatedAt());
    }

    @Test
    void blankCommentContentIsRejected() {
        assertThrows(IllegalArgumentException.class, () -> Comment.create(1L, "   ", "support-user"));
    }

    @Test
    void commentContentUpdateUsesSameValidationRule() {
        Comment comment = Comment.create(1L, "Initial note", "support-user");

        comment.updateContent("Updated note");

        assertEquals("Updated note", comment.getContent());
        assertThrows(IllegalArgumentException.class, () -> comment.updateContent("   "));
    }
}
