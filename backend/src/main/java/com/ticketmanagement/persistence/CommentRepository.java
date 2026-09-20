package com.ticketmanagement.persistence;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<CommentEntity, Long> {
	List<CommentEntity> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
