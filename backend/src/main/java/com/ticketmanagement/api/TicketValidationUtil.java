package com.ticketmanagement.api;

import com.ticketmanagement.domain.TicketPriority;
import com.ticketmanagement.domain.TicketStatus;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class TicketValidationUtil {

    private TicketValidationUtil() {
    }

    public static String normalizeRequiredText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " is required");
        }
        return value.trim();
    }

    public static TicketPriority validatePriority(String rawPriority) {
        if (rawPriority == null || rawPriority.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "priority is required");
        }

        try {
            return TicketPriority.valueOf(rawPriority.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid ticket priority");
        }
    }

    public static TicketStatus validateStatus(String rawStatus) {
        if (rawStatus == null || rawStatus.isBlank()) {
            return null;
        }

        try {
            return TicketStatus.valueOf(rawStatus.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid ticket status");
        }
    }

    public static String normalizeOptionalText(String value) {
        return value == null ? null : value.trim();
    }
}
