package com.zone01.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DatabaseConfig {

    @Bean
    public CommandLineRunner dropNotificationConstraint(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check");
                System.out.println("Successfully dropped notifications_type_check constraint.");
            } catch (Exception e) {
                System.err.println("Failed to drop constraint: " + e.getMessage());
            }
        };
    }
}
