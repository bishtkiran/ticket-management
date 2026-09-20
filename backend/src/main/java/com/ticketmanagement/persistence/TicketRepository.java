package com.ticketmanagement.persistence;

import com.ticketmanagement.domain.TicketStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TicketRepository extends JpaRepository<TicketEntity, Long> {
	List<TicketEntity> findByStatus(TicketStatus status);

	@Query("""
		select ticket from TicketEntity ticket
		where lower(ticket.title) like lower(concat('%', :keyword, '%'))
		   or lower(ticket.description) like lower(concat('%', :keyword, '%'))
		""")
	List<TicketEntity> searchByKeyword(@Param("keyword") String keyword);
}
