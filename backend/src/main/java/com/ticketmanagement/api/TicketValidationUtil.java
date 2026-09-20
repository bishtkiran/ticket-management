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

    public static void validateStatusTransition(TicketStatus currentStatus, TicketStatus nextStatus) {
        if (nextStatus == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status is required");
        }

        if (currentStatus == null) {
            if (nextStatus != TicketStatus.OPEN) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Invalid ticket status transition from null to " + nextStatus);
            }
            return;
        }

        boolean allowed = switch (currentStatus) {
            case OPEN -> nextStatus == TicketStatus.IN_PROGRESS || nextStatus == TicketStatus.CANCELLED;
            case IN_PROGRESS -> nextStatus == TicketStatus.RESOLVED || nextStatus == TicketStatus.CANCELLED;
            case RESOLVED -> nextStatus == TicketStatus.CLOSED;
            default -> false;
        };

        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Invalid ticket status transition from " + currentStatus + " to " + nextStatus);
        }
    }

    public static String normalizeOptionalText(String value) {
        return value == null ? null : value.trim();
    }
}
