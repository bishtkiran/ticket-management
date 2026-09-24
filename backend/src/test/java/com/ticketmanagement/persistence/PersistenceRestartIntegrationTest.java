package com.ticketmanagement.persistence;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.ticketmanagement.TicketManagementApplication;
import com.ticketmanagement.domain.TicketPriority;
import com.ticketmanagement.domain.TicketStatus;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;

class PersistenceRestartIntegrationTest {

    @TempDir
    Path dataDirectory;

    @Test
    void keepsTicketsAfterApplicationContextRestart() {
        Long ticketId;

        try (ConfigurableApplicationContext context = startApplication()) {
            TicketRepository repository = context.getBean(TicketRepository.class);
            TicketEntity saved = repository.saveAndFlush(new TicketEntity(
                "Persistent ticket",
                "This ticket must survive an application restart",
                TicketStatus.OPEN,
                TicketPriority.HIGH,
                "support-team"
            ));
            ticketId = saved.getId();
        }

        try (ConfigurableApplicationContext restartedContext = startApplication()) {
            TicketRepository repository = restartedContext.getBean(TicketRepository.class);

            assertTrue(repository.existsById(ticketId));
            assertEquals("Persistent ticket", repository.findById(ticketId).orElseThrow().getTitle());
        }
    }

    private ConfigurableApplicationContext startApplication() {
        return new SpringApplicationBuilder(TicketManagementApplication.class)
            .profiles("dev")
            .web(WebApplicationType.NONE)
            .properties(
                "APP_DATA_DIR=" + dataDirectory.toAbsolutePath(),
                "spring.main.banner-mode=off",
                "logging.level.root=ERROR"
            )
            .run();
    }
}
