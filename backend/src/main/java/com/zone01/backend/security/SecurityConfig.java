package com.zone01.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF for testing with Postman
                .csrf(csrf -> csrf.disable())
                // Define which requests are allowed without authentication
                .authorizeHttpRequests(auth -> auth
                .requestMatchers("/login", "/register").permitAll() // 👈 allow login/register
                .anyRequest().authenticated() // all others need authentication
                )
                // Disable default login form
                .formLogin(login -> login.disable())
                // Disable HTTP Basic auth
                .httpBasic(basic -> basic.disable());
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt is the most commonly used secure password encoder
        return new BCryptPasswordEncoder();
    }
}
