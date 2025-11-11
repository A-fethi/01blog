package com.zone01.backend.dto;

import java.time.LocalDateTime;

import com.zone01.backend.entity.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UserDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.createdAt = (LocalDateTime) user.getCreatedAt();
        this.updatedAt = user.getUpdatedAt();
    }
}