package com.ticketmanagement.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicLong;

public class Comment {
    private static final AtomicLong ID_GENERATOR = new AtomicLong(1L);

    private final Long id;
    private final Long ticketId;
    private String content;
    private final Instant createdAt;
    private String createdBy;

    private Comment(Long id, Long ticketId, String content, String createdBy, Instant createdAt) {
        this.id = id;
        this.ticketId = Objects.requireNonNull(ticketId, "ticketId is required");
        this.content = requireText(content, "content");
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }

    public static Comment create(Long ticketId, String content, String createdBy) {
        return new Comment(ID_GENERATOR.getAndIncrement(), ticketId, content, createdBy, Instant.now());
    }

    public void updateContent(String content) {
        this.content = requireText(content, "content");
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

    public Long getTicketId() {
        return ticketId;
    }

    public String getContent() {
        return content;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }
}
