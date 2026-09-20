package com.ticketmanagement.api.dto;

import java.time.Instant;

public class CommentResponse {
    private Long id;
    private Long ticketId;
    private String content;
    private Instant createdAt;
    private String createdBy;

    public CommentResponse(Long id, Long ticketId, String content, Instant createdAt, String createdBy) {
        this.id = id;
        this.ticketId = ticketId;
        this.content = content;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
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