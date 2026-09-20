package com.ticketmanagement.service;

import com.ticketmanagement.api.TicketValidationUtil;
import com.ticketmanagement.api.dto.CommentCreateRequest;
import com.ticketmanagement.api.dto.CommentResponse;
import com.ticketmanagement.api.dto.TicketCreateRequest;
import com.ticketmanagement.api.dto.TicketStatusUpdateRequest;
import com.ticketmanagement.api.dto.TicketResponse;
import com.ticketmanagement.api.dto.TicketUpdateRequest;
import com.ticketmanagement.domain.TicketPriority;
import com.ticketmanagement.domain.TicketStatus;
import com.ticketmanagement.persistence.TicketEntity;
import com.ticketmanagement.persistence.CommentEntity;
import com.ticketmanagement.persistence.CommentRepository;
import com.ticketmanagement.persistence.TicketRepository;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;

    public TicketServiceImpl(TicketRepository ticketRepository, CommentRepository commentRepository) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
    }

    @Override
    public TicketResponse createTicket(TicketCreateRequest request) {
        String title = TicketValidationUtil.validateTitle(request.getTitle());
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
        String normalizedKeyword = TicketValidationUtil.normalizeSearchKeyword(keyword);
        TicketStatus normalizedStatus = TicketValidationUtil.validateStatus(status);

        List<TicketEntity> tickets = normalizedStatus == null
            ? (normalizedKeyword == null ? ticketRepository.findAll() : ticketRepository.searchByKeyword(normalizedKeyword))
            : (normalizedKeyword == null
                ? ticketRepository.findByStatus(normalizedStatus)
                : ticketRepository.findAll().stream()
                    .filter(ticket -> ticket.getStatus() == normalizedStatus)
                    .filter(ticket -> containsIgnoreCase(ticket.getTitle(), normalizedKeyword)
                        || containsIgnoreCase(ticket.getDescription(), normalizedKeyword))
                    .collect(Collectors.toList()));

        return tickets
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

    @Override
    public TicketResponse updateTicket(Long id, TicketUpdateRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }

        boolean hasUpdate = request.getTitle() != null || request.getDescription() != null
            || request.getPriority() != null || request.getAssignee() != null;
        if (!hasUpdate) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one field must be provided");
        }

        TicketEntity entity = ticketRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        if (request.getTitle() != null) {
            entity.setTitle(TicketValidationUtil.validateTitle(request.getTitle()));
        }
        if (request.getDescription() != null) {
            entity.setDescription(TicketValidationUtil.normalizeRequiredText(request.getDescription(), "description"));
        }
        if (request.getPriority() != null) {
            entity.setPriority(TicketValidationUtil.validatePriority(request.getPriority()));
        }
        if (request.getAssignee() != null) {
            entity.setAssignee(TicketValidationUtil.normalizeOptionalText(request.getAssignee()));
        }

        TicketEntity saved = ticketRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public TicketResponse updateTicketStatus(Long id, TicketStatusUpdateRequest request) {
        if (request == null || request.getStatus() == null || request.getStatus().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status is required");
        }

        TicketEntity entity = ticketRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        TicketStatus nextStatus = TicketValidationUtil.validateStatus(request.getStatus());
        if (nextStatus == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status is required");
        }

        TicketValidationUtil.validateStatusTransition(entity.getStatus(), nextStatus);

        entity.setStatus(nextStatus);
        Instant now = Instant.now();
        if (nextStatus == TicketStatus.CLOSED) {
            entity.setClosedAt(now);
            entity.setCancelledAt(null);
        } else if (nextStatus == TicketStatus.CANCELLED) {
            entity.setCancelledAt(now);
            entity.setClosedAt(null);
        } else {
            entity.setClosedAt(null);
            entity.setCancelledAt(null);
        }

        TicketEntity saved = ticketRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public CommentResponse addComment(Long ticketId, CommentCreateRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }

        String content = TicketValidationUtil.normalizeRequiredText(request.getContent(), "content");
        TicketEntity ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        CommentEntity saved = commentRepository.save(new CommentEntity(ticket, content, null));
        return toCommentResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> listComments(Long ticketId) {
        ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
            .stream()
            .map(this::toCommentResponse)
            .collect(Collectors.toList());
    }

    private boolean containsIgnoreCase(String value, String keyword) {
        return value != null && value.toLowerCase().contains(keyword.toLowerCase());
    }

    private CommentResponse toCommentResponse(CommentEntity entity) {
        return new CommentResponse(
            entity.getId(),
            entity.getTicket().getId(),
            entity.getContent(),
            entity.getCreatedAt(),
            entity.getCreatedBy()
        );
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
