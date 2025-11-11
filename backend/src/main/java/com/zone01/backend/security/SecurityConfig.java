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
                .requestMatchers("/",
                        "/api/auth/register",
                        "/api/auth/login",
                        "/api/users",
                        "/api/users/{id}",
                        "/api/posts",
                        "/api/posts/user/{id}",
                        "/api/comments/post/{postId}"
                ).permitAll() // 👈 allow login/register
                .anyRequest().authenticated() // all others need authentication
                )
                // Disable default login form
                .formLogin(form -> form
                .loginPage("/api/auth/login")
                .defaultSuccessUrl("/", true)
                .permitAll()
                )
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
