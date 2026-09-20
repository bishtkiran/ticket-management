package com.ticketmanagement.service;

import com.ticketmanagement.api.TicketValidationUtil;
import com.ticketmanagement.api.dto.TicketCreateRequest;
import com.ticketmanagement.api.dto.TicketResponse;
import com.ticketmanagement.domain.TicketPriority;
import com.ticketmanagement.domain.TicketStatus;
import com.ticketmanagement.persistence.TicketEntity;
import com.ticketmanagement.persistence.TicketRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;

    public TicketServiceImpl(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @Override
    public TicketResponse createTicket(TicketCreateRequest request) {
        String title = TicketValidationUtil.normalizeRequiredText(request.getTitle(), "title");
        String description = TicketValidationUtil.normalizeRequiredText(request.getDescription(), "description");
        TicketPriority priority = TicketValidationUtil.validatePriority(request.getPriority());
        String assignee = TicketValidationUtil.normalizeOptionalText(request.getAssignee());

        TicketEntity entity = new TicketEntity(
            title,
            description,
            TicketStatus.OPEN,
            priority,
            assignee
        );

        TicketEntity saved = ticketRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public List<TicketResponse> listTickets(String keyword, String status) {
        if (keyword != null && keyword.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "keyword must not be blank");
        }
        TicketValidationUtil.validateStatus(status);

        return ticketRepository.findAll()
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @Override
    public TicketResponse getTicket(Long id) {
        TicketEntity entity = ticketRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
        return toResponse(entity);
    }

    private TicketResponse toResponse(TicketEntity entity) {
        return new TicketResponse(
            entity.getId(),
            entity.getTitle(),
            entity.getDescription(),
            entity.getStatus() == null ? null : entity.getStatus().name(),
            entity.getPriority() == null ? null : entity.getPriority().name(),
            entity.getAssignee(),
            entity.getCreatedAt(),
            entity.getUpdatedAt(),
            entity.getClosedAt(),
            entity.getCancelledAt()
        );
    }
}
