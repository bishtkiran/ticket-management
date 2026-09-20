package com.ticketmanagement.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicLong;

public class Ticket {
    private static final AtomicLong ID_GENERATOR = new AtomicLong(1L);

    private final Long id;
    private String title;
    private String description;
    private TicketStatus status;
    private TicketPriority priority;
    private String assignee;
    private final Instant createdAt;
    private Instant updatedAt;
    private Instant closedAt;
    private Instant cancelledAt;

    private Ticket(Long id, String title, String description, TicketPriority priority, String assignee, Instant createdAt) {
        this.id = id;
        this.title = requireText(title, "title");
        this.description = requireText(description, "description");
        this.priority = Objects.requireNonNull(priority, "priority is required");
        this.assignee = assignee;
        this.status = TicketStatus.OPEN;
        this.createdAt = createdAt;
        this.updatedAt = createdAt;
    }

    public static Ticket create(String title, String description, TicketPriority priority, String assignee) {
        return new Ticket(ID_GENERATOR.getAndIncrement(), title, description, priority, assignee, Instant.now());
    }

    public void update(String title, String description, TicketPriority priority, String assignee) {
        this.title = requireText(title, "title");
        this.description = requireText(description, "description");
        this.priority = Objects.requireNonNull(priority, "priority is required");
        this.assignee = assignee;
        this.updatedAt = Instant.now();
    }

    public void changeStatus(TicketStatus newStatus) {
        Objects.requireNonNull(newStatus, "newStatus is required");

        if (isTransitionAllowed(this.status, newStatus)) {
            this.status = newStatus;
            this.updatedAt = Instant.now();

            if (newStatus == TicketStatus.CLOSED) {
                this.closedAt = Instant.now();
            } else if (newStatus == TicketStatus.CANCELLED) {
                this.cancelledAt = Instant.now();
            } else {
                this.closedAt = null;
                this.cancelledAt = null;
            }
            return;
        }

        throw new IllegalStateException("Invalid ticket status transition from " + this.status + " to " + newStatus);
    }

    private boolean isTransitionAllowed(TicketStatus current, TicketStatus next) {
        if (current == null) {
            return next == TicketStatus.OPEN;
        }

        if (current == TicketStatus.OPEN) {
            return next == TicketStatus.IN_PROGRESS || next == TicketStatus.CANCELLED;
        }

        if (current == TicketStatus.IN_PROGRESS) {
            return next == TicketStatus.RESOLVED || next == TicketStatus.CANCELLED;
        }

        if (current == TicketStatus.RESOLVED) {
            return next == TicketStatus.CLOSED;
        }

        return false;
    }

    private static String requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        return value.trim();
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public TicketPriority getPriority() {
        return priority;
    }

    public String getAssignee() {
        return assignee;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Instant getClosedAt() {
        return closedAt;
    }

    public Instant getCancelledAt() {
        return cancelledAt;
    }
}
