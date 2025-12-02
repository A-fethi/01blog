package com.zone01.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.zone01.backend.dto.UserDTO;
import com.zone01.backend.entity.Role;
import com.zone01.backend.entity.User;
import com.zone01.backend.security.AppUserDetails;
import com.zone01.backend.service.UserService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers(
            @AuthenticationPrincipal AppUserDetails auth) {
        if (auth == null || auth.getUser().getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<User> users = userService.getAllUsers();
        List<UserDTO> userDTOs = users.stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(userDTOs);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboardStats(
            @AuthenticationPrincipal AppUserDetails auth) {
        if (auth == null || auth.getUser().getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Map<String, Object> stats = new HashMap<>();

        long totalUsers = userService.getAllUsers().size();
        stats.put("totalUsers", totalUsers);
        stats.put("regularUsers", totalUsers - 1L);

        return ResponseEntity.ok(stats);
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal AppUserDetails auth) {
        if (auth == null || auth.getUser().getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (auth.getUser().getId().equals(userId)) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "You cannot delete yourself");
            return ResponseEntity.badRequest().body(error);
        }

        if (!userService.findById(userId).isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not found");
            return ResponseEntity.badRequest().body(error);
        }

        userService.deleteUser(userId);
        Map<String, String> success = new HashMap<>();
        success.put("success", "User deleted successfully");
        return ResponseEntity.ok(success);
    }
}
