package com.ticketmanagement.api.dto;

import java.util.List;

public class TicketListResponse {
    private final List<TicketResponse> items;
    private final int page;
    private final int size;
    private final long totalElements;

    public TicketListResponse(List<TicketResponse> items, int page, int size, long totalElements) {
        this.items = items;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
    }

    public List<TicketResponse> getItems() {
        return items;
    }

    public int getPage() {
        return page;
    }

    public int getSize() {
        return size;
    }

    public long getTotalElements() {
        return totalElements;
    }
}
