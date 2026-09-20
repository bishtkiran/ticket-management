package com.ticketmanagement.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.ticketmanagement.domain.TicketPriority;
import com.ticketmanagement.domain.TicketStatus;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class TicketValidationUtilTest {

    @Test
    void titleIsRequiredAndTrimmed() {
        assertEquals("Login issue", TicketValidationUtil.validateTitle("  Login issue  "));
        assertThrows(ResponseStatusException.class, () -> TicketValidationUtil.validateTitle("  "));
    }

    @Test
    void priorityMustBeSupported() {
        assertEquals(TicketPriority.HIGH, TicketValidationUtil.validatePriority(" high "));
        assertThrows(ResponseStatusException.class, () -> TicketValidationUtil.validatePriority("urgent"));
    }

    @Test
    void assigneeMayBeUnassignedButCannotExceedStorageLimit() {
        assertNull(TicketValidationUtil.normalizeOptionalText("  "));
        assertEquals("alice@example.com", TicketValidationUtil.normalizeOptionalText(" alice@example.com "));
        assertThrows(ResponseStatusException.class, () ->
            TicketValidationUtil.normalizeOptionalText("a".repeat(256)));
    }

    @Test
    void searchKeywordIsTrimmedAndBlankMeansNoFilter() {
        assertEquals("login", TicketValidationUtil.normalizeSearchKeyword("  login  "));
        assertNull(TicketValidationUtil.normalizeSearchKeyword("   "));
        assertNull(TicketValidationUtil.normalizeSearchKeyword(null));
    }

    @Test
    void statusFilterAcceptsOnlySupportedStates() {
        assertEquals(TicketStatus.IN_PROGRESS, TicketValidationUtil.validateStatus(" in_progress "));
        assertThrows(ResponseStatusException.class, () -> TicketValidationUtil.validateStatus("UNKNOWN"));
    }
}
